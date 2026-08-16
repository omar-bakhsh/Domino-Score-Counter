// App.js
// الملف الرئيسي للتطبيق - نسخة الفرق ولعبة الـ 70 نقطة المخصصة

import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// استيراد المكونات التي قمنا بإنشائها
import CustomCamera from './components/CustomCamera';
import DominoOverlay from './components/DominoOverlay';
import Scoreboard from './components/Scoreboard';
import GameHistory from './components/GameHistory';
import Settings from './components/Settings';

export default function App() {
  // التنقل والتبويبات
  const [activeTab, setActiveTab] = useState('scoreboard'); // 'scoreboard' | 'history' | 'settings'

  // الكاميرا ومحرر الصور
  const [showCamera, setShowCamera] = useState(false);
  const [scannedImageUri, setScannedImageUri] = useState(null);
  
  // نقاط ممسوحة معلقة يتم إرسالها للوحة النتائج
  const [pendingScanScore, setPendingScanScore] = useState(null);

  // إعدادات اللعب (تحتوي على تفعيل الأحجار الداكنة)
  const [gameSettings, setGameSettings] = useState({
    darkTiles: false, // أحجار داكنة بنقاط بيضاء
    egyptianRules: true, // النقاط المتبقية (احتساب نقاط الخصم)
  });

  // حالة اللعبة النشطة وسجل الألعاب
  const [activeGame, setActiveGame] = useState(null);
  const [gameHistory, setGameHistory] = useState([
    // بيانات تجريبية للفريقين للشرح والمظهر الاحترافي
    {
      id: 'demo-1',
      date: '١٦/٨/٢٠٢٦',
      winner: 'فريق الفهد',
      rounds: [
        { winner: 'team1', points: 15 },
        { winner: 'team2', points: 25 },
        { winner: 'team1', points: 56 }
      ],
      team1: {
        name: 'فريق الفهد',
        players: ['أحمد', 'خالد'],
        score: 71,
        history: [15, 0, 56]
      },
      team2: {
        name: 'فريق الصقور',
        players: ['ياسر', 'عادل'],
        score: 25,
        history: [0, 25, 0]
      },
      targetScore: 70,
      isFinished: true
    }
  ]);

  // دالة بدء اللعبة
  const handleStartGame = (gameData) => {
    setActiveGame(gameData);
    setActiveTab('scoreboard');
  };

  // دالة تحديث وحفظ اللعبة الحالية (جولات ونقاط)
  const handleSaveGame = (updatedGame) => {
    setActiveGame(updatedGame);
    
    // إذا انتهت اللعبة، نقوم بإضافتها إلى السجل وتصفير اللعبة النشطة
    if (updatedGame.isFinished) {
      setGameHistory(prev => [updatedGame, ...prev]);
    }
  };

  // إنهاء المباراة الحالية يدوياً وحفظها بالسجل كغير مكتملة
  const handleEndGame = () => {
    if (activeGame) {
      const endedGame = {
        ...activeGame,
        isFinished: true,
        winner: activeGame.winner || 'إنهاء يدوي'
      };
      setGameHistory(prev => [endedGame, ...prev]);
      setActiveGame(null);
    }
  };

  // حذف مباراة معينة من السجل
  const handleDeleteGameHistory = (gameId) => {
    setGameHistory(prev => prev.filter(g => g.id !== gameId));
  };

  // مسح السجل بالكامل
  const handleClearHistory = () => {
    setGameHistory([]);
  };

  // التعامل مع نتيجة المسح من المحرر التفاعلي
  const handleConfirmScan = (totalScore, detectedTiles) => {
    setPendingScanScore(totalScore);
    setScannedImageUri(null);
  };

  // إعادة التصوير من المحرر
  const handleRetakeScan = () => {
    setScannedImageUri(null);
    setShowCamera(true);
  };

  // شاشات التنقل الرئيسية
  const renderTabContent = () => {
    switch (activeTab) {
      case 'scoreboard':
        return (
          <Scoreboard
            activeGame={activeGame}
            onStartGame={handleStartGame}
            onEndGame={handleEndGame}
            onSaveGame={handleSaveGame}
            onTriggerScan={() => setShowCamera(true)}
            pendingScanScore={pendingScanScore}
            clearPendingScanScore={() => setPendingScanScore(null)}
          />
        );
      case 'history':
        return (
          <GameHistory
            history={gameHistory}
            onDeleteGame={handleDeleteGameHistory}
            onClearHistory={handleClearHistory}
          />
        );
      case 'settings':
        return (
          <Settings
            settings={gameSettings}
            onUpdateSettings={setGameSettings}
          />
        );
      default:
        return null;
    }
  };

  // إذا كانت الكاميرا نشطة
  if (showCamera) {
    return (
      <CustomCamera
        onImageSelected={(uri) => {
          setScannedImageUri(uri);
          setShowCamera(false);
        }}
        onCancel={() => setShowCamera(false)}
      />
    );
  }

  // إذا تم التقاط صورة وجاري كشفها وتعديلها
  if (scannedImageUri) {
    return (
      <DominoOverlay
        imageUri={scannedImageUri}
        onConfirm={handleConfirmScan}
        onRetake={handleRetakeScan}
        gameSettings={gameSettings}
      />
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* محتوى الشاشة الفعلي */}
      <View style={styles.content}>
        {renderTabContent()}
      </View>

      {/* شريط التنقل السفلي الاحترافي */}
      <View style={styles.tabBar}>
        {/* تبويب الإعدادات */}
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'settings' && styles.activeTabItem]} 
          onPress={() => setActiveTab('settings')}
        >
          <Ionicons 
            name={activeTab === 'settings' ? "settings" : "settings-outline"} 
            size={22} 
            color={activeTab === 'settings' ? "#00ffcc" : "#888"} 
          />
          <Text style={[styles.tabLabel, activeTab === 'settings' && styles.activeTabLabel]}>الإعدادات</Text>
        </TouchableOpacity>

        {/* تبويب سجل الألعاب */}
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'history' && styles.activeTabItem]} 
          onPress={() => setActiveTab('history')}
        >
          <Ionicons 
            name={activeTab === 'history' ? "time" : "time-outline"} 
            size={22} 
            color={activeTab === 'history' ? "#00ffcc" : "#888"} 
          />
          <Text style={[styles.tabLabel, activeTab === 'history' && styles.activeTabLabel]}>سجل اللعب</Text>
        </TouchableOpacity>

        {/* تبويب الحاسبة ولوحة النقاط */}
        <TouchableOpacity 
          style={[styles.tabItem, activeTab === 'scoreboard' && styles.activeTabItem]} 
          onPress={() => setActiveTab('scoreboard')}
        >
          <Ionicons 
            name={activeTab === 'scoreboard' ? "people" : "people-outline"} 
            size={22} 
            color={activeTab === 'scoreboard' ? "#00ffcc" : "#888"} 
          />
          <Text style={[styles.tabLabel, activeTab === 'scoreboard' && styles.activeTabLabel]}>لوحة النقاط</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderColor: '#2a2a2a',
    paddingVertical: 10,
    height: 65,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  activeTabItem: {
    borderTopWidth: 0,
  },
  tabLabel: {
    color: '#888',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#00ffcc',
    fontWeight: 'bold',
  },
});
