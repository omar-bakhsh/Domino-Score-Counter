// components/CustomCamera.js
// واجهة الكاميرا الاحترافية - نسخة متوافقة مع متطلبات التموضع المطلق لـ Expo SDK 54

import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

export default function CustomCamera({ onImageSelected, onCancel }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState('back');
  const [enableTorch, setEnableTorch] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const cameraRef = useRef(null);

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00ffcc" />
        <Text style={styles.loadingText}>جاري التحقق من صلاحيات الكاميرا...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.iconWrapper}>
          <Ionicons name="camera-outline" size={80} color="#ff3b30" />
        </View>
        <Text style={styles.permissionTitle}>مطلوب إذن الكاميرا</Text>
        <Text style={styles.permissionDesc}>
          يحتاج التطبيق للوصول إلى الكاميرا ليتمكن من مسح أحجار الضومنو تلقائياً وحساب النقاط.
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>السماح بالوصول للكاميرا</Text>
        </TouchableOpacity>
        {onCancel && (
          <TouchableOpacity style={styles.cancelLink} onPress={onCancel}>
            <Text style={styles.cancelLinkText}>إلغاء والعودة للوحة النقاط</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  const takePicture = async () => {
    if (cameraRef.current && !isCapturing) {
      try {
        setIsCapturing(true);
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.85,
          skipProcessing: false,
        });
        if (photo && photo.uri) {
          onImageSelected(photo.uri);
        }
      } catch (error) {
        console.error("Error taking picture:", error);
        alert("فشل التقاط الصورة. يرجى المحاولة مجدداً.");
      } finally {
        setIsCapturing(false);
      }
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.9,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("فشل اختيار الصورة من المعرض.");
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. الكاميرا كعنصر مستقل خلفي */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
        enableTorch={enableTorch}
        ref={cameraRef}
      />

      {/* 2. واجهات التحكم العلوية والسفلية والتعليمات متوضعة بشكل مطلق فوق الكاميرا */}
      <View style={styles.contentOverlay}>
        
        {/* شريط التحكم العلوي */}
        <View style={styles.headerControls}>
          <TouchableOpacity style={styles.circleButton} onPress={onCancel}>
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>مسح الضومنو</Text>
          <TouchableOpacity 
            style={[styles.circleButton, enableTorch && styles.activeTorch]} 
            onPress={() => setEnableTorch(!enableTorch)}
          >
            <Ionicons 
              name={enableTorch ? "flash" : "flash-off"} 
              size={22} 
              color={enableTorch ? "#00ffcc" : "#fff"} 
            />
          </TouchableOpacity>
        </View>

        {/* إطار التوجيه والتعليمات بالوسط */}
        <View style={styles.centerContainer}>
          <View style={styles.focusFrame}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
            
            <View style={styles.centerTipContainer}>
              <Text style={styles.centerTipText}>ضع أحجار الضومنو للخصم داخل الإطار</Text>
            </View>
          </View>

          {/* تلميحات التصوير */}
          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 تعليمات المسح للخصم:</Text>
            <View style={styles.tipRow}>
              <Ionicons name="sunny-outline" size={14} color="#00ffcc" />
              <Text style={styles.tipText}>تجنب الإضاءة المنعكسة المباشرة والظلال الحادة.</Text>
            </View>
            <View style={styles.tipRow}>
              <Ionicons name="contrast-outline" size={14} color="#00ffcc" />
              <Text style={styles.tipText}>ضع القطع البيضاء على طاولة داكنة (بني، كحلي، أسود).</Text>
            </View>
          </View>
        </View>

        {/* شريط التحكم السفلي */}
        <View style={styles.footerControls}>
          {/* معرض الصور */}
          <TouchableOpacity style={styles.sideButton} onPress={pickImage} disabled={isCapturing}>
            <Ionicons name="images-outline" size={28} color="#fff" />
            <Text style={styles.sideButtonText}>المعرض</Text>
          </TouchableOpacity>

          {/* زر التقاط الصورة الرئيسي */}
          <TouchableOpacity style={styles.captureButton} onPress={takePicture} disabled={isCapturing}>
            {isCapturing ? (
              <ActivityIndicator size="large" color="#111" />
            ) : (
              <View style={styles.captureInnerCircle} />
            )}
          </TouchableOpacity>

          {/* تبديل الكاميرا */}
          <TouchableOpacity 
            style={styles.sideButton} 
            onPress={() => setFacing(facing === 'back' ? 'front' : 'back')}
            disabled={isCapturing}
          >
            <Ionicons name="camera-reverse-outline" size={28} color="#fff" />
            <Text style={styles.sideButtonText}>قلب</Text>
          </TouchableOpacity>
        </View>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#fff',
    fontSize: 16,
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#121212',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  iconWrapper: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  permissionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionDesc: {
    color: '#aaa',
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  permissionButton: {
    backgroundColor: '#00ffcc',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  permissionButtonText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelLink: {
    marginTop: 20,
    padding: 10,
  },
  cancelLinkText: {
    color: '#aaa',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
  contentOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.15)', // تعتيم خفيف جداً لرؤية مريحة للكاميرا
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  circleButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeTorch: {
    backgroundColor: 'rgba(0, 255, 204, 0.2)',
    borderWidth: 1,
    borderColor: '#00ffcc',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  focusFrame: {
    width: '80%',
    aspectRatio: 0.85,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  corner: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderColor: '#00ffcc',
  },
  topLeft: {
    top: 0,
    left: 0,
    borderLeftWidth: 4,
    borderTopWidth: 4,
    borderTopLeftRadius: 8,
  },
  topRight: {
    top: 0,
    right: 0,
    borderRightWidth: 4,
    borderTopWidth: 4,
    borderTopRightRadius: 8,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderLeftWidth: 4,
    borderBottomWidth: 4,
    borderBottomLeftRadius: 8,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderRightWidth: 4,
    borderBottomWidth: 4,
    borderBottomRightRadius: 8,
  },
  centerTipContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  centerTipText: {
    color: 'rgba(0,255,204,0.9)',
    fontSize: 12,
    fontWeight: 'bold',
  },
  tipsCard: {
    backgroundColor: 'rgba(18, 18, 18, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 14,
    padding: 12,
    width: '85%',
    marginTop: 20,
  },
  tipsTitle: {
    color: '#00ffcc',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'right',
  },
  tipRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginVertical: 3,
  },
  tipText: {
    color: '#ddd',
    fontSize: 11,
    marginRight: 6,
    textAlign: 'right',
    flex: 1,
  },
  footerControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingVertical: 25,
    paddingHorizontal: 10,
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#fff',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  captureInnerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#000',
    backgroundColor: '#fff',
  },
  sideButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 70,
  },
  sideButtonText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 5,
  },
});
