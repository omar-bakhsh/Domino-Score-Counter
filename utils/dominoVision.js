// utils/dominoVision.js
// خوارزمية الرؤية الحاسوبية الاحترافية - معززة بالتطبيع اللوني التلقائي (Auto-Contrast Stretching) وتعديل الحساسية الديناميكي

import * as ImageManipulator from 'expo-image-manipulator';

/**
 * تهيئة ومعالجة الصورة للكشف عن نقاط الضومنو الفردية بدقة عالية
 * @param {string} imageUri - مسار الصورة المحلي
 * @param {WebGLRenderingContext} gl - سياق WebGL من expo-gl
 * @param {object} options - خيارات المعالجة { sensitivity, isInverted }
 */
export const detectDominoes = async (imageUri, gl, options = {}) => {
  const { isInverted = false, sensitivity = 14 } = options;

  // 1. تصغير الصورة بدقة متوازنة (300x400)
  const width = 300;
  const height = 400;
  
  let manipulatedImage;
  try {
    manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width, height } }],
      { format: ImageManipulator.SaveFormat.JPEG, compress: 0.9 }
    );
  } catch (error) {
    console.error("Error resizing image:", error);
    throw new Error("فشل في معالجة وتصغير الصورة");
  }

  const localUri = manipulatedImage.uri;

  // 2. قراءة بكسلات الصورة عبر WebGL
  let pixels;
  try {
    pixels = await readPixelsFromImage(gl, localUri, width, height);
  } catch (error) {
    console.error("Error reading pixels:", error);
    throw new Error("فشل في قراءة بكسلات الصورة");
  }

  // 3. تحويل البكسلات لتدرج رمادي
  const gray = new Uint8Array(width * height);
  let minGray = 255;
  let maxGray = 0;

  for (let i = 0; i < width * height; i++) {
    const r = pixels[i * 4];
    const g = pixels[i * 4 + 1];
    const b = pixels[i * 4 + 2];
    const lum = Math.floor(0.299 * r + 0.587 * g + 0.114 * b);
    gray[i] = lum;
    if (lum < minGray) minGray = lum;
    if (lum > maxGray) maxGray = lum;
  }

  // 4. تعزيز التباين التلقائي (Auto-Contrast / Histogram Stretching)
  // يضمن وضوح النقاط السوداء وجعل جسم الحجر الأبيض ساطعاً حتى في الإضاءة الخافتة أو صور الشاشات
  const grayRange = maxGray - minGray;
  if (grayRange > 25) {
    for (let i = 0; i < width * height; i++) {
      gray[i] = Math.floor(((gray[i] - minGray) / grayRange) * 255);
    }
  }

  // 5. حساب الصورة التكاملية (Integral Image)
  const integral = new Int32Array(width * height);
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      sum += gray[idx];
      if (y === 0) {
        integral[idx] = sum;
      } else {
        integral[idx] = integral[idx - width] + sum;
      }
    }
  }

  // 6. تطبيق العتبة التكيفية (Adaptive Thresholding)
  const binary = new Uint8Array(width * height);
  const S = Math.floor(width / 7);
  const s2 = Math.floor(S / 2);
  const C = sensitivity;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      
      const x1 = Math.max(0, x - s2);
      const x2 = Math.min(width - 1, x + s2);
      const y1 = Math.max(0, y - s2);
      const y2 = Math.min(height - 1, y + s2);
      
      const count = (x2 - x1 + 1) * (y2 - y1 + 1);
      
      const idx_br = y2 * width + x2;
      const idx_tl = y1 * width + x1;
      const idx_tr = y1 * width + x2;
      const idx_bl = y2 * width + x1;
      
      let sum = integral[idx_br];
      if (x1 > 0) sum -= integral[idx_bl - 1];
      if (y1 > 0) sum -= integral[idx_tr - width];
      if (x1 > 0 && y1 > 0) sum += integral[idx_tl - width - 1];
      
      const average = sum / count;
      
      let isTileBody = gray[idx] > average - C;
      if (isInverted) {
        isTileBody = gray[idx] < average + C;
      }
      
      binary[idx] = isTileBody ? 255 : 0;
    }
  }

  // 7. كشف وتحديد كافة البقع الداكنة الصغيرة (النقاط Pips) في الصورة
  const pipBinary = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    pipBinary[i] = (binary[i] === 0) ? 255 : 0;
  }

  const labels = new Int32Array(width * height);
  let nextLabel = 1;
  const parent = [];

  const find = (i) => {
    let root = i;
    while (parent[root] !== root) root = parent[root];
    let curr = i;
    while (curr !== root) {
      let nxt = parent[curr];
      parent[curr] = root;
      curr = nxt;
    }
    return root;
  };

  const union = (i, j) => {
    const rootI = find(i);
    const rootJ = find(j);
    if (rootI !== rootJ) parent[rootI] = rootJ;
  };

  // الممر الأول لـ CCL
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      const isEdge = x < 3 || x > width - 4 || y < 3 || y > height - 4;
      
      if (pipBinary[idx] === 255 && !isEdge) {
        let topLabel = y > 0 ? labels[idx - width] : 0;
        let leftLabel = x > 0 ? labels[idx - 1] : 0;
        
        if (topLabel === 0 && leftLabel === 0) {
          labels[idx] = nextLabel;
          parent[nextLabel] = nextLabel;
          nextLabel++;
        } else if (topLabel !== 0 && leftLabel === 0) {
          labels[idx] = topLabel;
        } else if (topLabel === 0 && leftLabel !== 0) {
          labels[idx] = leftLabel;
        } else {
          labels[idx] = topLabel;
          if (topLabel !== leftLabel) union(topLabel, leftLabel);
        }
      }
    }
  }

  // الممر الثاني وتجميع بقع النقاط
  const componentInfo = {};
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (pipBinary[idx] === 255 && labels[idx] > 0) {
        const rootLabel = find(labels[idx]);
        labels[idx] = rootLabel;
        
        if (!componentInfo[rootLabel]) {
          componentInfo[rootLabel] = {
            sumX: 0, sumY: 0,
            minX: x, maxX: x,
            minY: y, maxY: y,
            area: 0
          };
        }
        const info = componentInfo[rootLabel];
        info.area++;
        info.sumX += x;
        info.sumY += y;
        if (x < info.minX) info.minX = x;
        if (x > info.maxX) info.maxX = x;
        if (y < info.minY) info.minY = y;
        if (y > info.maxY) info.maxY = y;
      }
    }
  }

  // فلترة وتجميع النقاط وحصرها داخل إطار التركيز
  const detectedPips = [];
  
  // حدود إطار التركيز الأوسط (من 8% إلى 92% أفقياً، ومن 12% إلى 88% رأسياً لمرونة إضافية)
  const minXPct = 8;
  const maxXPct = 92;
  const miNYPct = 12;
  const maNYPct = 88;

  Object.values(componentInfo).forEach((comp) => {
    const compW = comp.maxX - comp.minX + 1;
    const compH = comp.maxY - comp.minY + 1;
    const compAspectRatio = compW / compH;
    
    // نسبة الامتلاء داخل المستطيل الإحاطي
    const fillRatio = comp.area / (compW * compH);

    // 1. نسبة تناسب هندسي مرنة للزوايا المائلة (0.65 إلى 1.55)
    const hasValidAspectRatio = compAspectRatio >= 0.65 && compAspectRatio <= 1.55;

    // 2. نسبة امتلاء تمنع الحروف المفرغة (45% إلى 90%)
    const hasValidFillRatio = fillRatio >= 0.45 && fillRatio <= 0.90;

    // 3. مساحة النقطة المقبولة من 2 بكسل (للصور البعيدة أو الكثيرة) وحتى 250 بكسل (للمقربة)
    const hasValidArea = comp.area >= 2 && comp.area <= 250;

    if (hasValidArea && hasValidAspectRatio && hasValidFillRatio) {
      const px = Math.floor(comp.sumX / comp.area);
      const py = Math.floor(comp.sumY / comp.area);
      
      const xPct = (px / width) * 100;
      const yPct = (py / height) * 100;

      // 4. حصر الكشف داخل إطار الكاميرا الفعلي
      const isInsideFrame = xPct >= minXPct && xPct <= maxXPct && yPct >= miNYPct && yPct <= maNYPct;
      
      // 5. التحقق من كون النقطة داكنة بالنسبة للخلفية بعد التعزيز
      const centerIntensity = gray[px + py * width];
      const isDarkEnough = centerIntensity < 155; 

      if (isInsideFrame && isDarkEnough) {
        detectedPips.push({
          id: Math.random().toString(36).substring(2, 9),
          x: xPct,
          y: yPct
        });
      }
    }
  });

  return {
    pips: detectedPips,
    width,
    height
  };
};

/**
 * دالة قراءة بكسلات الصورة باستخدام WebGL في Expo مع حل مشكلة المزامنة والتأخير
 */
const readPixelsFromImage = async (gl, localUri, width, height) => {
  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, {
    localUri: localUri
  });

  await new Promise(resolve => setTimeout(resolve, 500));

  const framebuffer = gl.createFramebuffer();
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

  gl.deleteTexture(texture);
  gl.deleteFramebuffer(framebuffer);

  return pixels;
};
