// components/DominoOverlay.js
// محرر النقاط التفاعلي المتقدم - مزود بأزرار الحساسية الديناميكية والتعديل السريع (+/-) والمطابقة التامة للأبعاد

import React, { useState } from 'react';
import { StyleSheet, Text, View, Image, TouchableOpacity, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { GLView } from 'expo-gl';
import { Ionicons } from '@expo/vector-icons';
import { detectDominoes } from '../utils/dominoVision';

export default function DominoOverlay({ imageUri, onConfirm, onRetake, gameSettings = {} }) {
  const [pips, setPips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingError, setProcessingError] = useState(null);
  
  // حساسية الكاشف: 8 (منخفضة/صارمة) | 14 (متوازنة افتراضية) | 22 (عالية للصور الخافتة)
  const [sensitivity, setSensitivity] = useState(14);
  const [glInstance, setGlInstance] = useState(null);

  // المساحة الفعلية الظاهرة للصورة بعد عزل الأشرطة السوداء
  const [visibleImageLayout, setVisibleImageLayout] = useState({ width: 0, height: 0, left: 0, top: 0 });

  const isInverted = gameSettings.darkTiles || false;

  // تشغيل الكاشف عند تهيئة GL أو تغيير الحساسية
  const runDetection = async (gl, customSensitivity = sensitivity) => {
    try {
      setLoading(true);
      setProcessingError(null);
      
      const result = await detectDominoes(imageUri, gl, {
        isInverted: isInverted,
        sensitivity: customSensitivity
      });
      
      setPips(result.pips);
    } catch (error) {
      console.error("Error in pip detection:", error);
      setProcessingError("تعذر تحليل الصورة تلقائياً. يمكنك لمس الصورة أو استخدام أزرار (+/-) لتعديل النقاط.");
    } finally {
      setLoading(false);
    }
  };

  const handleGLContextCreate = (gl) => {
    setGlInstance(gl);
    runDetection(gl, sensitivity);
  };

  const changeSensitivity = (newSens) => {
    setSensitivity(newSens);
    if (glInstance) {
      runDetection(glInstance, newSens);
    }
  };

  // حساب الأبعاد والحدود الحقيقية للصورة (3:4) بناءً على حاوية العرض
  const handleParentLayout = (event) => {
    const { width: parentW, height: parentH } = event.nativeEvent.layout;
    if (parentW === 0 || parentH === 0) return;

    const imageAspectRatio = 3 / 4;
    const parentAspectRatio = parentW / parentH;

    let visibleW, visibleH, left, top;

    if (parentAspectRatio > imageAspectRatio) {
      visibleH = parentH;
      visibleW = parentH * imageAspectRatio;
      left = (parentW - visibleW) / 2;
      top = 0;
    } else {
      visibleW = parentW;
      visibleH = parentW / imageAspectRatio;
      left = 0;
      top = (parentH - visibleH) / 2;
    }

    setVisibleImageLayout({ width: visibleW, height: visibleH, left, top });
  };

  // التعامل مع لمس الصورة لإضافة/حذف نقطة
  const handleImagePress = (event) => {
    const { locationX, locationY } = event.nativeEvent;
    
    const xPct = (locationX / visibleImageLayout.width) * 100;
    const yPct = (locationY / visibleImageLayout.height) * 100;

    const tapRadius = 4.5;
    
    const clickedPipIndex = pips.findIndex(
      pip => Math.hypot(pip.x - xPct, pip.y - yPct) < tapRadius
    );

    if (clickedPipIndex !== -1) {
      const updated = pips.filter((_, idx) => idx !== clickedPipIndex);
      setPips(updated);
    } else {
      const newPip = {
        id: Math.random().toString(36).substring(2, 9),
        x: xPct,
        y: yPct
      };
      setPips([...pips, newPip]);
    }
  };

  // أزرار التعديل السريع (+1 / -1)
  const addQuickPip = () => {
    // إضافة نقطة افتراضية في المنتصف
    const newPip = {
      id: Math.random().toString(36).substring(2, 9),
      x: 50 + (Math.random() * 10 - 5),
      y: 50 + (Math.random() * 10 - 5)
    };
    setPips([...pips, newPip]);
  };

  const removeQuickPip = () => {
    if (pips.length > 0) {
      setPips(pips.slice(0, -1));
    }
  };

  const clearAllPips = () => {
    Alert.alert(
      "مسح جميع النقاط",
      "هل تريد مسح جميع علامات النقاط والبدء يدوياً بالكامل؟",
      [
        { text: "إلغاء", style: "cancel" },
        { text: "نعم، مسح الكل", style: "destructive", onPress: () => setPips([]) }
      ]
    );
  };

  const totalPips = pips.length;
  const roundedPoints = Math.floor(totalPips / 10) * 10;

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#00ffcc" />
          <Text style={styles.loadingText}>جاري كشف النقاط بالذكاء الاصطناعي...</Text>
        </View>
      )}

      {/* سياق GL الخفي للمعالجة البصرية */}
      <GLView 
        style={styles.hiddenGL} 
        onContextCreate={handleGLContextCreate} 
      />

      {/* لوحة التحكم العلوية */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={onRetake}>
          <Ionicons name="camera-outline" size={24} color="#fff" />
          <Text style={styles.buttonLabel}>إعادة تصوير</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>مراجعة نقاط الخصم</Text>
          <Text style={styles.subtitle}>انقر على الصورة أو استخدم أزرار +/-</Text>
        </View>
        <TouchableOpacity style={styles.confirmButton} onPress={() => onConfirm(totalPips, pips)}>
          <Text style={styles.confirmButtonText}>تأكيد ({roundedPoints} ن)</Text>
        </TouchableOpacity>
      </View>

      {/* شريط اختيار حساسية الكشف */}
      <View style={styles.sensitivityBar}>
        <Text style={styles.sensLabel}>حساسية الكاميرا:</Text>
        <View style={styles.sensButtonsGroup}>
          <TouchableOpacity
            style={[styles.sensBtn, sensitivity === 8 && styles.sensBtnActive]}
            onPress={() => changeSensitivity(8)}
          >
            <Text style={[styles.sensBtnText, sensitivity === 8 && styles.sensBtnTextActive]}>منخفضة (صارمة)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sensBtn, sensitivity === 14 && styles.sensBtnActive]}
            onPress={() => changeSensitivity(14)}
          >
            <Text style={[styles.sensBtnText, sensitivity === 14 && styles.sensBtnTextActive]}>متوازنة</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sensBtn, sensitivity === 22 && styles.sensBtnActive]}
            onPress={() => changeSensitivity(22)}
          >
            <Text style={[styles.sensBtnText, sensitivity === 22 && styles.sensBtnTextActive]}>عالية (حساسة)</Text>
          </TouchableOpacity>
        </View>
      </View>

      {processingError && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning-outline" size={16} color="#ff3b30" />
          <Text style={styles.errorText}>{processingError}</Text>
        </View>
      )}

      {/* لوحة الصورة التفاعلية */}
      <View style={styles.imageParentContainer} onLayout={handleParentLayout}>
        {visibleImageLayout.width > 0 && (
          <TouchableOpacity 
            activeOpacity={1}
            onPress={handleImagePress}
            style={[
              styles.imageWrapper,
              {
                position: 'absolute',
                left: visibleImageLayout.left,
                top: visibleImageLayout.top,
                width: visibleImageLayout.width,
                height: visibleImageLayout.height,
              }
            ]}
          >
            <Image source={{ uri: imageUri }} style={styles.image} resizeMode="stretch" />
            
            {pips.map((pip) => (
              <View
                key={pip.id}
                style={[
                  styles.pipDot,
                  {
                    left: `${pip.x}%`,
                    top: `${pip.y}%`,
                  }
                ]}
              />
            ))}
          </TouchableOpacity>
        )}
      </View>

      {/* لوحة التحكم والنتائج السفلية */}
      <View style={styles.footer}>
        {/* أزرار التعديل السريع والإجراءات */}
        <View style={styles.footerActionRow}>
          <TouchableOpacity style={styles.clearAllBtn} onPress={clearAllPips}>
            <Ionicons name="trash-outline" size={16} color="#ff8882" />
            <Text style={styles.clearAllBtnText}>مسح الكل</Text>
          </TouchableOpacity>

          <View style={styles.nudgeButtonsWrapper}>
            <TouchableOpacity style={styles.nudgeBtn} onPress={removeQuickPip}>
              <Ionicons name="remove" size={20} color="#fff" />
              <Text style={styles.nudgeBtnText}>-1 نقطة</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.nudgeBtn, styles.nudgeBtnAdd]} onPress={addQuickPip}>
              <Ionicons name="add" size={20} color="#121212" />
              <Text style={[styles.nudgeBtnText, { color: '#121212' }]}>+1 نقطة</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ملخص النقاط النهائي */}
        <View style={styles.summaryBar}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>النقاط المضافة للجولة:</Text>
            <Text style={styles.summaryValueBig}>{roundedPoints} ن</Text>
          </View>
          <View style={[styles.verticalLine, { height: 35 }]} />
          <View style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>إجمالي نقاط اليد (الدوتس):</Text>
            <Text style={styles.summaryValue}>{totalPips} نقاط</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  loadingText: {
    marginTop: 15,
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: 'bold',
  },
  hiddenGL: {
    width: 1,
    height: 1,
    opacity: 0,
    position: 'absolute',
  },
  header: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderColor: '#2a2a2a',
  },
  iconButton: {
    alignItems: 'center',
  },
  buttonLabel: {
    color: '#aaa',
    fontSize: 10,
    marginTop: 4,
  },
  titleContainer: {
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#00ffcc',
    fontSize: 11,
    marginTop: 2,
  },
  confirmButton: {
    backgroundColor: '#00ffcc',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  confirmButtonText: {
    color: '#121212',
    fontSize: 13,
    fontWeight: 'bold',
  },
  sensitivityBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: '#262626',
  },
  sensLabel: {
    color: '#888',
    fontSize: 11,
  },
  sensButtonsGroup: {
    flexDirection: 'row-reverse',
  },
  sensBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: '#262626',
    marginLeft: 6,
    borderWidth: 1,
    borderColor: '#333',
  },
  sensBtnActive: {
    backgroundColor: 'rgba(0, 255, 204, 0.15)',
    borderColor: '#00ffcc',
  },
  sensBtnText: {
    color: '#aaa',
    fontSize: 10,
  },
  sensBtnTextActive: {
    color: '#00ffcc',
    fontWeight: 'bold',
  },
  errorBanner: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  errorText: {
    color: '#ff8882',
    fontSize: 12,
    marginRight: 8,
  },
  imageParentContainer: {
    flex: 1,
    backgroundColor: '#050505',
    position: 'relative',
  },
  imageWrapper: {
    backgroundColor: '#000',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  pipDot: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#00ffcc',
    borderWidth: 2,
    borderColor: '#fff',
    marginLeft: -7,
    marginTop: -7,
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 5,
  },
  footer: {
    padding: 14,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderColor: '#2a2a2a',
  },
  footerActionRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  clearAllBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.3)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  clearAllBtnText: {
    color: '#ff8882',
    fontSize: 12,
    marginRight: 4,
    fontWeight: 'bold',
  },
  nudgeButtonsWrapper: {
    flexDirection: 'row-reverse',
  },
  nudgeBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: '#262626',
    borderWidth: 1,
    borderColor: '#444',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginLeft: 8,
  },
  nudgeBtnAdd: {
    backgroundColor: '#00ffcc',
    borderColor: '#00ffcc',
  },
  nudgeBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
    marginRight: 2,
  },
  summaryBar: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 4,
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryLabel: {
    color: '#888',
    fontSize: 11,
    marginBottom: 2,
  },
  summaryValue: {
    color: '#ddd',
    fontSize: 15,
    fontWeight: 'bold',
  },
  summaryValueBig: {
    color: '#00ffcc',
    fontSize: 22,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 255, 204, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6,
  },
  verticalLine: {
    width: 1.5,
    backgroundColor: '#2a2a2a',
  },
});
