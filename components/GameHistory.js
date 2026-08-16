// components/GameHistory.js
// شاشة سجل المباريات السابقة الملعوبة للفرق

import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function GameHistory({ history, onDeleteGame, onClearHistory }) {
  const handleDelete = (gameId) => {
    Alert.alert(
      "حذف المباراة",
      "هل تريد حذف هذه المباراة من السجل نهائياً؟",
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: "حذف", 
          style: "destructive",
          onPress: () => onDeleteGame(gameId)
        }
      ]
    );
  };

  const handleClearAll = () => {
    Alert.alert(
      "مسح السجل بالكامل",
      "هل أنت متأكد من مسح جميع المباريات المحفوظة؟ لا يمكن التراجع عن هذا الإجراء.",
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: "مسح الكل", 
          style: "destructive",
          onPress: onClearHistory
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* رأس الصفحة */}
      <View style={styles.header}>
        {history.length > 0 && (
          <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
            <Ionicons name="trash-bin-outline" size={16} color="#ff3b30" style={{ marginLeft: 4 }} />
            <Text style={styles.clearBtnText}>مسح الكل</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>سجل المباريات (70 ن)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {history.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconWrapper}>
              <Ionicons name="folder-open-outline" size={60} color="#555" />
            </View>
            <Text style={styles.emptyTitle}>السجل فارغ</Text>
            <Text style={styles.emptyDesc}>
              مباريات التحدي التي تنهيها ستظهر هنا مع تفاصيل النتائج النهائية للفرق.
            </Text>
          </View>
        ) : (
          history.map((game) => (
            <View key={game.id} style={styles.gameCard}>
              {/* تفاصيل علوية للمباراة */}
              <View style={styles.cardHeader}>
                <TouchableOpacity style={styles.deleteCardBtn} onPress={() => handleDelete(game.id)}>
                  <Ionicons name="close" size={20} color="#ff8882" />
                </TouchableOpacity>
                
                <View style={styles.dateAndRounds}>
                  <Text style={styles.gameDate}>{game.date}</Text>
                  <View style={styles.dotDivider} />
                  <Text style={styles.gameRounds}>{game.rounds.length} جولات</Text>
                </View>
              </View>

              {/* الفائز باللعبة */}
              <View style={styles.winnerSection}>
                <Ionicons name="trophy-sharp" size={20} color="#ffd700" style={{ marginLeft: 8 }} />
                <Text style={styles.winnerLabel}>الفريق البطل:</Text>
                <Text style={styles.winnerValue}>{game.winner || 'تعادل / لم يكتمل'}</Text>
              </View>

              {/* نقاط ونتائج الفريقين */}
              <View style={styles.teamsComparisonContainer}>
                {/* الفريق الأول */}
                <View style={styles.teamScoreBox}>
                  <Text style={styles.teamBoxName} numberOfLines={1}>{game.team1.name}</Text>
                  <Text style={styles.teamBoxPlayers}>{game.team1.players.join(' & ')}</Text>
                  <Text style={styles.teamBoxScore}>{game.team1.score} ن</Text>
                </View>

                <View style={styles.vsDivider}>
                  <Text style={styles.vsDividerText}>ضد</Text>
                </View>

                {/* الفريق الثاني */}
                <View style={styles.teamScoreBox}>
                  <Text style={styles.teamBoxName} numberOfLines={1}>{game.team2.name}</Text>
                  <Text style={styles.teamBoxPlayers}>{game.team2.players.join(' & ')}</Text>
                  <Text style={styles.teamBoxScore}>{game.team2.score} ن</Text>
                </View>
              </View>
            </View>
          ))
        )}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderColor: '#2a2a2a',
    backgroundColor: '#1a1a1a',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  clearBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  clearBtnText: {
    color: '#ff3b30',
    fontSize: 13,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
    paddingBottom: 30,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 30,
  },
  emptyIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1e1e1e',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  emptyTitle: {
    color: '#ddd',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyDesc: {
    color: '#666',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  gameCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#2a2a2a',
    paddingBottom: 10,
    marginBottom: 12,
  },
  deleteCardBtn: {
    padding: 2,
  },
  dateAndRounds: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
  },
  gameDate: {
    color: '#888',
    fontSize: 12,
  },
  dotDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#444',
    marginHorizontal: 8,
  },
  gameRounds: {
    color: '#888',
    fontSize: 12,
  },
  winnerSection: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  winnerLabel: {
    color: '#aaa',
    fontSize: 13,
    marginLeft: 6,
  },
  winnerValue: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamsComparisonContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  teamScoreBox: {
    flex: 0.44,
    backgroundColor: '#262626',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  teamBoxName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  teamBoxPlayers: {
    color: '#888',
    fontSize: 9,
    marginTop: 2,
  },
  teamBoxScore: {
    color: '#00ffcc',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 6,
  },
  vsDivider: {
    flex: 0.12,
    alignItems: 'center',
  },
  vsDividerText: {
    color: '#555',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
