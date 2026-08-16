// components/Settings.js
// شاشة الإعدادات ودليل اللعب المحدث لقوانين الـ 70 نقطة للفرق

import React from 'react';
import { StyleSheet, Text, View, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function Settings({ settings, onUpdateSettings }) {
  const toggleSetting = (key) => {
    onUpdateSettings({
      ...settings,
      [key]: !settings[key]
    });
  };

  return (
    <View style={styles.container}>
      {/* رأس الصفحة */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>الإعدادات ودليل اللعبة</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* قسم خيارات الكشف الذكي */}
        <Text style={styles.sectionHeader}>رؤية الكمبيوتر والكشف الذكي</Text>
        
        <View style={styles.card}>
          {/* خيار الأحجار الداكنة */}
          <View style={styles.settingRow}>
            <Switch
              trackColor={{ false: '#2a2a2a', true: '#00cc99' }}
              thumbColor={settings.darkTiles ? '#00ffcc' : '#f4f3f4'}
              ios_backgroundColor="#1a1a1a"
              onValueChange={() => toggleSetting('darkTiles')}
              value={settings.darkTiles}
            />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>أحجار ضومنو داكنة (معكوسة)</Text>
              <Text style={styles.settingDesc}>فعل هذا الخيار إذا كنت تلعب بأحجار سوداء ذات نقاط بيضاء.</Text>
            </View>
          </View>
        </View>

        {/* قسم قواعد اللعب */}
        <Text style={styles.sectionHeader}>قواعد احتساب المباراة الحالية</Text>
        
        <View style={styles.card}>
          {/* قانون الـ 70 للفرق */}
          <View style={styles.settingRow}>
            <Switch
              trackColor={{ false: '#2a2a2a', true: '#00cc99' }}
              thumbColor={true ? '#00ffcc' : '#f4f3f4'}
              ios_backgroundColor="#1a1a1a"
              value={true}
              disabled={true}
            />
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingLabel}>قانون لعب الفرق (الـ 70 نقطة)</Text>
              <Text style={styles.settingDesc}>قاعدة النزول بـ 20 نقطة كحد أدنى. وتقريب نقاط الخصم لعشرة أدنى (مثال: 15 تحسب 10، 45 تحسب 40).</Text>
            </View>
          </View>
        </View>

        {/* قسم الدليل التفصيلي لقوانين اللعبة */}
        <Text style={styles.sectionHeader}>شرح مفصل لقانون اللعب (الـ 70)</Text>
        
        <View style={styles.guideCard}>
          <View style={styles.ruleStep}>
            <Text style={styles.ruleNumberLabel}>1</Text>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>شرط النزول (الدخول في اللعب)</Text>
              <Text style={styles.stepDesc}>لا يسجل الفريق أي نقاط في رصيده في بداية المباراة إلا إذا فاز بجولة كانت نقاط الخصم الفعلية فيها 20 نقطة أو أكثر. إذا فاز بـ 15 نقطة خصم وكان رصيده 0، لا يسجل له شيء ويظل رصيده 0.</Text>
            </View>
          </View>

          <View style={styles.ruleStep}>
            <Text style={styles.ruleNumberLabel}>2</Text>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>حساب النقاط والتقريب</Text>
              <Text style={styles.stepDesc}>يتم تقريب نقاط يد الخصم المتبقية لأقرب عشرة أدنى. حيث أن 15 تصبح 10 نقاط، و 45 تصبح 40 نقطة، و 19 تصبح 10 نقاط. بمجرد فتح اللعب (النزول)، يقبل رصيد الفريق أي نقاط جولة لاحقة بمعدل 10 نقاط أو أكثر.</Text>
            </View>
          </View>

          <View style={styles.ruleStep}>
            <Text style={styles.ruleNumberLabel}>3</Text>
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>هدف المباراة</Text>
              <Text style={styles.stepDesc}>تستمر جولات اللعب حتى يصل أحد الفريقين إلى 70 نقطة (7 بنوط) أولاً ليفوز بالمباراة الكلية.</Text>
            </View>
          </View>
        </View>

        {/* قسم الإرشادات وكيفية عمل الكاشف */}
        <Text style={styles.sectionHeader}>دليل تصوير الأحجار بالكاميرا</Text>
        
        <View style={styles.guideCard}>
          <View style={styles.guideStep}>
            <Ionicons name="contrast" size={20} color="#00ffcc" style={{ marginLeft: 12 }} />
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>التباين اللوني</Text>
              <Text style={styles.stepDesc}>ضع الأحجار على سطح متباين (مثال: قطع بيضاء على طاولة داكنة كطاولات المقاهي الخشبية أو القماشية).</Text>
            </View>
          </View>

          <View style={styles.guideStep}>
            <Ionicons name="camera" size={20} color="#00ffcc" style={{ marginLeft: 12 }} />
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>زاوية رأسية مستقيمة</Text>
              <Text style={styles.stepDesc}>التقط الصورة مباشرة من الأعلى بشكل مستقيم وتجنب تمييل الكاميرا للحصول على أدق قراءة لبكسلات الأحجار.</Text>
            </View>
          </View>

          <View style={styles.guideStep}>
            <Ionicons name="build" size={20} color="#ffd700" style={{ marginLeft: 12 }} />
            <View style={styles.stepTextContainer}>
              <Text style={styles.stepTitle}>التصحيح السريع والذكي</Text>
              <Text style={styles.stepDesc}>إذا لم يتم كشف حجر بسبب إضاءة عاكسة أو ظل، انقر على القطعة في محرر الصور لتعديل قيمها يدوياً أو لحذف التحديد الخاطئ لضمان دقة كاملة.</Text>
            </View>
          </View>
        </View>

        <Text style={styles.versionText}>تطبيق حاسب الضومنو للفرق v1.1.0</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1a1a1a',
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionHeader: {
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: 'bold',
    marginVertical: 12,
    textAlign: 'right',
  },
  card: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 10,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingTextContainer: {
    flex: 1,
    paddingLeft: 16,
    alignItems: 'flex-end',
  },
  settingLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  settingDesc: {
    color: '#888',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'right',
  },
  guideCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 20,
  },
  ruleStep: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  ruleNumberLabel: {
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: 'bold',
    width: 26,
    height: 26,
    borderRadius: 13,
    textAlign: 'center',
    lineHeight: 26,
    marginLeft: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.3)',
  },
  guideStep: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginVertical: 12,
  },
  stepTextContainer: {
    flex: 1,
    alignItems: 'flex-end',
  },
  stepTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'right',
  },
  stepDesc: {
    color: '#aaa',
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'right',
  },
  versionText: {
    color: '#444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },
});
