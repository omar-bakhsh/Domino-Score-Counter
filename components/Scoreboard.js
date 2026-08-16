// components/Scoreboard.js
// لوحة نتائج مباريات الضومنو للفرق - نسخة متميزة مع الرسم البياني وإدخال النقاط السريع بنقرة واحدة

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Alert, Modal, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Line, Path, Circle, Text as SvgText, Rect } from 'react-native-svg';

export default function Scoreboard({ 
  activeGame, 
  onStartGame, 
  onEndGame, 
  onSaveGame, 
  onTriggerScan, 
  pendingScanScore,
  clearPendingScanScore
}) {
  // للعبة الجديدة
  const [team1Name, setTeam1Name] = useState('الفريق الأول');
  const [team1Player1, setTeam1Player1] = useState('لاعب 1');
  const [team1Player2, setTeam1Player2] = useState('لاعب 2');

  const [team2Name, setTeam2Name] = useState('الفريق الثاني');
  const [team2Player1, setTeam2Player1] = useState('لاعب 3');
  const [team2Player2, setTeam2Player2] = useState('لاعب 4');

  const [isStartingNew, setIsStartingNew] = useState(false);

  // لتسجيل جولة جديدة
  const [showAddRoundModal, setShowAddRoundModal] = useState(false);
  const [roundWinner, setRoundWinner] = useState('team1'); // 'team1' or 'team2'
  const [losingPoints, setLosingPoints] = useState(''); // نقاط الخصم الخاسر (Remaining Pips)

  // معالجة القيمة الممسوحة من الكاميرا
  React.useEffect(() => {
    if (pendingScanScore !== null && showAddRoundModal) {
      setLosingPoints(pendingScanScore.toString());
      clearPendingScanScore();
      Alert.alert("تم الكشف", `تم كشف واحتساب ${pendingScanScore} نقطة خصم من الكاميرا.`);
    }
  }, [pendingScanScore, showAddRoundModal]);

  const startNewGame = () => {
    const t1 = team1Name.trim() || 'الفريق الأول';
    const t2 = team2Name.trim() || 'الفريق الثاني';

    const gameData = {
      id: Math.random().toString(36).substring(2, 9),
      team1: {
        name: t1,
        players: [team1Player1.trim() || 'لاعب 1', team1Player2.trim() || 'لاعب 2'],
        score: 0,
        history: [0], // نبدأ من 0 للرسم البياني
        hasOpened: false
      },
      team2: {
        name: t2,
        players: [team2Player1.trim() || 'لاعب 3', team2Player2.trim() || 'لاعب 4'],
        score: 0,
        history: [0], // نبدأ من 0 للرسم البياني
        hasOpened: false
      },
      targetScore: 70,
      rounds: [], // [{ winner: 'team1' | 'team2', rawPips: number, addedPoints: number, note: string }]
      date: new Date().toLocaleDateString('ar-EG'),
      isFinished: false,
      winner: null
    };

    onStartGame(gameData);
    setIsStartingNew(false);
  };

  // فتح نافذة جولة جديدة
  const openNewRoundModal = () => {
    if (!activeGame) return;
    setLosingPoints('');
    setRoundWinner('team1');
    setShowAddRoundModal(true);
  };

  // مسح نقاط الخصم الخاسر بالكاميرا
  const handleScanLosingPoints = () => {
    onTriggerScan();
  };

  // تسجيل الجولة وتطبيق قواعد النزول والتقريب
  const submitRound = () => {
    const rawPips = parseInt(losingPoints);
    if (isNaN(rawPips) || rawPips < 0) {
      Alert.alert("خطأ", "يرجى كتابة أو مسح نقاط صحيحة وموجبة للخصم الخاسر.");
      return;
    }

    const isTeam1Winner = roundWinner === 'team1';
    const winningTeamKey = isTeam1Winner ? 'team1' : 'team2';
    const winningTeam = activeGame[winningTeamKey];

    // 1. تقريب النقاط لأقرب 10 أدنى (Math.floor)
    let calculatedPoints = Math.floor(rawPips / 10) * 10;
    let addedPoints = 0;
    let note = '';

    // 2. تطبيق شرط النزول (20 نقطة كحد أدنى للدخول في اللعبة)
    if (!winningTeam.hasOpened) {
      if (rawPips >= 20) {
        addedPoints = calculatedPoints;
        note = 'نزول صحيح';
      } else {
        addedPoints = 0;
        note = 'لم يتحقق شرط النزول (أقل من 20)';
        Alert.alert("تنبيه النزول", `الفريق لم يفتح اللعب بعد. نقاط الخصم الفعلية (${rawPips} ن) أقل من 20 نقطة، لذا تم تسجيل 0 نقاط لهذه الجولة.`);
      }
    } else {
      addedPoints = calculatedPoints;
      note = 'إضافة نقاط عادية';
    }

    const updatedTeam1 = {
      ...activeGame.team1,
      score: activeGame.team1.score + (isTeam1Winner ? addedPoints : 0),
      history: [...activeGame.team1.history, activeGame.team1.score + (isTeam1Winner ? addedPoints : 0)],
      hasOpened: activeGame.team1.hasOpened || (isTeam1Winner && addedPoints >= 20)
    };

    const updatedTeam2 = {
      ...activeGame.team2,
      score: activeGame.team2.score + (isTeam1Winner ? 0 : addedPoints),
      history: [...activeGame.team2.history, activeGame.team2.score + (isTeam1Winner ? 0 : addedPoints)],
      hasOpened: activeGame.team2.hasOpened || (!isTeam1Winner && addedPoints >= 20)
    };

    // التحقق من انتهاء المباراة عند 70 نقطة
    let isGameOver = false;
    let finalWinnerName = null;

    if (updatedTeam1.score >= 70) {
      isGameOver = true;
      finalWinnerName = updatedTeam1.name;
    } else if (updatedTeam2.score >= 70) {
      isGameOver = true;
      finalWinnerName = updatedTeam2.name;
    }

    const newRound = {
      winner: roundWinner,
      rawPips: rawPips,
      addedPoints: addedPoints,
      note: note
    };

    const updatedGame = {
      ...activeGame,
      team1: updatedTeam1,
      team2: updatedTeam2,
      rounds: [...activeGame.rounds, newRound],
      isFinished: isGameOver,
      winner: finalWinnerName
    };

    onSaveGame(updatedGame);
    setShowAddRoundModal(false);

    if (isGameOver) {
      Alert.alert(
        "🎉 مبروك الفوز بالبطولة!",
        `تجاوز ${finalWinnerName} حاجز الـ 70 نقطة وتوج بطلاً للمباراة!\n\nالنتيجة النهائية:\n${updatedTeam1.name}: ${updatedTeam1.score} ن\n${updatedTeam2.name}: ${updatedTeam2.score} ن`,
        [{ text: "تم" }]
      );
    }
  };

  // التراجع عن الجولة الأخيرة
  const undoLastRound = () => {
    if (!activeGame || activeGame.rounds.length === 0) return;

    Alert.alert(
      "تراجع عن الجولة",
      "هل أنت متأكد من حذف نقاط الجولة الأخيرة؟",
      [
        { text: "إلغاء", style: "cancel" },
        { 
          text: "تراجع", 
          style: "destructive",
          onPress: () => {
            const lastRound = activeGame.rounds[activeGame.rounds.length - 1];
            const isTeam1Winner = lastRound.winner === 'team1';

            const updatedTeam1 = {
              ...activeGame.team1,
              score: Math.max(0, activeGame.team1.score - (isTeam1Winner ? lastRound.addedPoints : 0)),
              history: activeGame.team1.history.slice(0, -1),
              hasOpened: activeGame.team1.history.length > 2 // الفتح يظل صحيحاً إذا كان هناك جولات سابقة
            };

            const updatedTeam2 = {
              ...activeGame.team2,
              score: Math.max(0, activeGame.team2.score - (isTeam1Winner ? 0 : lastRound.addedPoints)),
              history: activeGame.team2.history.slice(0, -1),
              hasOpened: activeGame.team2.history.length > 2
            };

            // تصحيح حالة الفتح عند التراجع للصفر
            if (updatedTeam1.score === 0) updatedTeam1.hasOpened = false;
            if (updatedTeam2.score === 0) updatedTeam2.hasOpened = false;

            const updatedGame = {
              ...activeGame,
              team1: updatedTeam1,
              team2: updatedTeam2,
              rounds: activeGame.rounds.slice(0, -1),
              isFinished: false,
              winner: null
            };

            onSaveGame(updatedGame);
          }
        }
      ]
    );
  };

  // توليد مسار الرسم البياني SVG التفاعلي للفرق
  const renderProgressChart = () => {
    if (!activeGame || activeGame.team1.history.length < 2) {
      return (
        <View style={styles.emptyChartContainer}>
          <Ionicons name="trending-up" size={24} color="#444" style={{ marginBottom: 6 }} />
          <Text style={styles.emptyChartText}>الرسم البياني سيظهر هنا عند بدء الجولات</Text>
        </View>
      );
    }

    const t1History = activeGame.team1.history;
    const t2History = activeGame.team2.history;
    const roundsCount = t1History.length; // يشمل نقطة الصفر البدئية

    const svgW = 300;
    const svgH = 130;
    const startX = 30;
    const endX = 280;
    const startY = 110; // يمثل 0 نقاط
    const endY = 15;   // يمثل 70 نقطة

    // حساب إحداثيات كل جولة
    const getCoords = (history) => {
      return history.map((score, index) => {
        const x = startX + (index / (roundsCount - 1)) * (endX - startX);
        const y = startY - (score / 70) * (startY - endY);
        return { x, y, score };
      });
    };

    const t1Coords = getCoords(t1History);
    const t2Coords = getCoords(t2History);

    // بناء المسار (Path D string)
    const buildPath = (coords) => {
      if (coords.length === 0) return '';
      return coords.reduce((path, pt, idx) => {
        return idx === 0 ? `M ${pt.x} ${pt.y}` : `${path} L ${pt.x} ${pt.y}`;
      }, '');
    };

    const t1Path = buildPath(t1Coords);
    const t2Path = buildPath(t2Coords);

    // خطوط الشبكة الأفقية
    const gridPoints = [0, 20, 40, 60, 70];

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>منحنى تقدم المباراة (الـ 70)</Text>
        <Svg width="100%" height={svgH} viewBox={`0 0 ${svgW} ${svgH}`}>
          {/* خطوط الخلفية الأفقية */}
          {gridPoints.map((val) => {
            const y = startY - (val / 70) * (startY - endY);
            const isTarget = val === 70;
            return (
              <React.Fragment key={`grid-${val}`}>
                <Line
                  x1={startX}
                  y1={y}
                  x2={endX}
                  y2={y}
                  stroke={isTarget ? '#ff3b30' : '#2d2d2d'}
                  strokeDasharray={isTarget ? '3,3' : '0'}
                  strokeWidth={isTarget ? 1.5 : 1}
                />
                <SvgText
                  x={startX - 8}
                  y={y + 4}
                  fill={isTarget ? '#ff8882' : '#666'}
                  fontSize="8"
                  textAnchor="end"
                  fontWeight={isTarget ? 'bold' : 'normal'}
                >
                  {val}
                </SvgText>
              </React.Fragment>
            );
          })}

          {/* مسار نقاط الفريق الأول (Cyan) */}
          {t1Path && (
            <Path
              d={t1Path}
              fill="none"
              stroke="#00ffcc"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* مسار نقاط الفريق الثاني (Gold) */}
          {t2Path && (
            <Path
              d={t2Path}
              fill="none"
              stroke="#ffd700"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* عقد نقاط الفريق الأول */}
          {t1Coords.map((pt, idx) => (
            <Circle
              key={`t1-pt-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#00ffcc"
              stroke="#121212"
              strokeWidth="1.5"
            />
          ))}

          {/* عقد نقاط الفريق الثاني */}
          {t2Coords.map((pt, idx) => (
            <Circle
              key={`t2-pt-${idx}`}
              cx={pt.x}
              cy={pt.y}
              r="3.5"
              fill="#ffd700"
              stroke="#121212"
              strokeWidth="1.5"
            />
          ))}
        </Svg>
        {/* دليل الرسم البياني السفلي */}
        <View style={styles.chartLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: '#ffd700' }]} />
            <Text style={styles.legendText}>{activeGame.team2.name}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendIndicator, { backgroundColor: '#00ffcc' }]} />
            <Text style={styles.legendText}>{activeGame.team1.name}</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 1. الترحيب وبدء اللعبة */}
      {!activeGame && !isStartingNew && (
        <View style={styles.welcomeCard}>
          <View style={styles.dominoIconWrapper}>
            <Ionicons name="people" size={70} color="#00ffcc" />
          </View>
          <Text style={styles.welcomeTitle}>حاسب الضومنو للفرق (70 نقطة)</Text>
          <Text style={styles.welcomeDesc}>
            تطبيق مخصص للعب الثنائي (فريقين من 4 أشخاص) حتى 70 نقطة.
            {'\n'}
            * تقريب النقاط لأقرب 10 أدنى (15 ينحسب 10، و45 ينحسب 40).
            {'\n'}
            * شرط النزول: يجب تسجيل 20 نقطة خصم كحد أدنى في الجولة الأولى لفتح اللعب.
          </Text>
          
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setIsStartingNew(true)}>
            <Ionicons name="play" size={20} color="#121212" style={{ marginLeft: 8 }} />
            <Text style={styles.primaryBtnText}>بدء مباراة جديدة</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 2. إعداد الفرق واللاعبين الأربعة */}
      {!activeGame && isStartingNew && (
        <View style={styles.setupCard}>
          <Text style={styles.sectionTitle}>تجهيز مباراة الفرق (الهدف: 70 نقطة)</Text>
          
          {/* الفريق الأول */}
          <View style={styles.teamSetupBlock}>
            <Text style={styles.teamHeaderLabel}>👥 الفريق الأول</Text>
            <TextInput
              style={styles.input}
              value={team1Name}
              onChangeText={setTeam1Name}
              placeholder="اسم الفريق الأول (مثال: فريق الفهد)"
              placeholderTextColor="#666"
              textAlign="right"
            />
            <View style={styles.playersInputRow}>
              <TextInput
                style={[styles.input, styles.playerInputHalf]}
                value={team1Player2}
                onChangeText={setTeam1Player2}
                placeholder="اللاعب الثاني"
                placeholderTextColor="#666"
                textAlign="right"
              />
              <TextInput
                style={[styles.input, styles.playerInputHalf]}
                value={team1Player1}
                onChangeText={setTeam1Player1}
                placeholder="اللاعب الأول"
                placeholderTextColor="#666"
                textAlign="right"
              />
            </View>
          </View>

          {/* الفريق الثاني */}
          <View style={styles.teamSetupBlock}>
            <Text style={styles.teamHeaderLabel}>👥 الفريق الثاني</Text>
            <TextInput
              style={styles.input}
              value={team2Name}
              onChangeText={setTeam2Name}
              placeholder="اسم الفريق الثاني (مثال: فريق الصقور)"
              placeholderTextColor="#666"
              textAlign="right"
            />
            <View style={styles.playersInputRow}>
              <TextInput
                style={[styles.input, styles.playerInputHalf]}
                value={team2Player2}
                onChangeText={setTeam2Player2}
                placeholder="اللاعب الثاني"
                placeholderTextColor="#666"
                textAlign="right"
              />
              <TextInput
                style={[styles.input, styles.playerInputHalf]}
                value={team2Player1}
                onChangeText={setTeam2Player1}
                placeholder="اللاعب الأول"
                placeholderTextColor="#666"
                textAlign="right"
              />
            </View>
          </View>

          {/* أزرار التشغيل */}
          <View style={styles.setupActions}>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => setIsStartingNew(false)}>
              <Text style={styles.secondaryBtnText}>إلغاء</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.primaryBtnSmall} onPress={startNewGame}>
              <Text style={styles.primaryBtnTextSmall}>ابدأ التحدي</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* 3. شاشة لوحة النتائج للفريقين */}
      {activeGame && (
        <View style={styles.gameContainer}>
          {/* لوحة النتائج الشبيهة بالبطولات */}
          <View style={styles.scoreboardCard}>
            <Text style={styles.targetLimitText}>الهدف للفوز: 70 نقطة (7 بنط)</Text>
            
            <View style={styles.vsScoresRow}>
              {/* الفريق الأول */}
              <View style={styles.teamScoreCol}>
                <Text style={styles.teamScoreName} numberOfLines={1}>{activeGame.team1.name}</Text>
                <Text style={styles.teamPlayersText}>{activeGame.team1.players.join(' & ')}</Text>
                
                {/* النقاط والنزول */}
                <Text style={styles.bigScoreText}>{activeGame.team1.score}</Text>
                <View style={[styles.statusBadge, activeGame.team1.hasOpened ? styles.badgeOpen : styles.badgeClosed]}>
                  <Text style={styles.statusBadgeText}>
                    {activeGame.team1.hasOpened ? 'فُتح اللعب' : 'انتظار النزول (20)'}
                  </Text>
                </View>
              </View>

              {/* فاصل VS */}
              <View style={styles.vsSpacer}>
                <Text style={styles.vsText}>ضد</Text>
                <View style={styles.vsLine} />
              </View>

              {/* الفريق الثاني */}
              <View style={styles.teamScoreCol}>
                <Text style={styles.teamScoreName} numberOfLines={1}>{activeGame.team2.name}</Text>
                <Text style={styles.teamPlayersText}>{activeGame.team2.players.join(' & ')}</Text>
                
                {/* النقاط والنزول */}
                <Text style={styles.bigScoreText}>{activeGame.team2.score}</Text>
                <View style={[styles.statusBadge, activeGame.team2.hasOpened ? styles.badgeOpen : styles.badgeClosed]}>
                  <Text style={styles.statusBadgeText}>
                    {activeGame.team2.hasOpened ? 'فُتح اللعب' : 'انتظار النزول (20)'}
                  </Text>
                </View>
              </View>
            </View>

            {/* أشرطة التقدم */}
            <View style={styles.teamsProgressContainer}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.progressPercent}>{Math.min(100, Math.round((activeGame.team2.score / 70) * 100))}%</Text>
                <Text style={styles.progressPercent}>{Math.min(100, Math.round((activeGame.team1.score / 70) * 100))}%</Text>
              </View>
              
              <View style={styles.doubleProgressBar}>
                <View style={[
                  styles.barHalf, 
                  styles.barRight,
                  { width: `${Math.min(100, (activeGame.team1.score / 70) * 100)}%`, backgroundColor: '#00ffcc' }
                ]} />
                <View style={[
                  styles.barHalf, 
                  styles.barLeft,
                  { width: `${Math.min(100, (activeGame.team2.score / 70) * 100)}%`, backgroundColor: '#ffd700' }
                ]} />
              </View>
            </View>
          </View>

          {/* الرسم البياني لتقدم المباراة */}
          {renderProgressChart()}

          {/* شريط الإجراءات والتحكم بالجولات */}
          <View style={styles.actionRow}>
            {activeGame.isFinished ? (
              <TouchableOpacity style={styles.endGameBtn} onPress={onEndGame}>
                <Ionicons name="ribbon-outline" size={18} color="#fff" style={{ marginLeft: 6 }} />
                <Text style={styles.endGameBtnText}>حفظ المباراة وإنهاء الجلسة</Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity 
                  style={[styles.actionBtn, styles.undoBtn, activeGame.rounds.length === 0 && styles.disabledBtn]} 
                  onPress={undoLastRound}
                  disabled={activeGame.rounds.length === 0}
                >
                  <Ionicons name="arrow-undo" size={18} color={activeGame.rounds.length === 0 ? "#666" : "#ffcc00"} />
                  <Text style={[styles.actionBtnText, { color: activeGame.rounds.length === 0 ? "#666" : "#ffcc00" }]}>تراجع</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.actionBtn, styles.newRoundBtn]} onPress={openNewRoundModal}>
                  <Ionicons name="add" size={20} color="#121212" style={{ marginLeft: 4 }} />
                  <Text style={[styles.actionBtnText, { color: '#121212' }]}>تسجيل جولة</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* سجل الجولات التفصيلي */}
          <View style={styles.roundsCard}>
            <Text style={styles.roundsCardTitle}>جولات اللعب ({activeGame.rounds.length})</Text>
            
            {activeGame.rounds.length === 0 ? (
              <Text style={styles.emptyRoundsText}>لا توجد جولات مسجلة بعد. انقر على "تسجيل جولة" لتسجيل نقاط الخصم لليد الفائزة.</Text>
            ) : (
              [...activeGame.rounds].reverse().map((round, rIdx) => {
                const roundNum = activeGame.rounds.length - rIdx;
                const isTeam1Winner = round.winner === 'team1';
                const wasAdded = round.addedPoints > 0;
                
                return (
                  <View key={`r-${rIdx}`} style={styles.roundRow}>
                    <Text style={styles.roundNumber}>الجولة {roundNum}</Text>
                    <View style={styles.roundScoreDetails}>
                      <Text style={styles.roundWinnerDetailText}>
                        فاز <Text style={isTeam1Winner ? styles.winnerTeamHighlight : styles.winnerTeamHighlight2}>
                          {isTeam1Winner ? activeGame.team1.name : activeGame.team2.name}
                        </Text>
                        {wasAdded ? (
                          <Text> بـ <Text style={styles.pointsHighlight}>+{round.addedPoints} ن</Text> (من أصل {round.rawPips} ن للخصم)</Text>
                        ) : (
                          <Text style={{ color: '#ff8882' }}> (لم تحتسب {round.rawPips} ن لعدم النزول)</Text>
                        )}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      )}

      {/* مودال تسجيل جولة جديدة للفرق */}
      <Modal
        visible={showAddRoundModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowAddRoundModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>تسجيل جولة جديدة</Text>

            {activeGame && (
              <ScrollView style={{ width: '100%' }}>
                {/* 1. من الفائز بالجولة */}
                <Text style={styles.modalSectionLabel}>الفريق الفائز بالجولة:</Text>
                <View style={styles.teamWinnerSelector}>
                  <TouchableOpacity
                    style={[styles.teamWinnerOpt, roundWinner === 'team1' && styles.teamWinnerOptActive]}
                    onPress={() => setRoundWinner('team1')}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={roundWinner === 'team1' ? '#00ffcc' : '#555'} style={{ marginLeft: 6 }} />
                    <Text style={[styles.teamWinnerOptText, roundWinner === 'team1' && styles.teamWinnerOptTextActive]}>{activeGame.team1.name}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.teamWinnerOpt, roundWinner === 'team2' && styles.teamWinnerOptActive]}
                    onPress={() => setRoundWinner('team2')}
                  >
                    <Ionicons name="checkmark-circle" size={16} color={roundWinner === 'team2' ? '#ffd700' : '#555'} style={{ marginLeft: 6 }} />
                    <Text style={[styles.teamWinnerOptText, roundWinner === 'team2' && styles.teamWinnerOptTextActive]}>{activeGame.team2.name}</Text>
                  </TouchableOpacity>
                </View>

                {/* 2. إدخال نقاط الخصم */}
                <Text style={styles.modalSectionLabel}>
                  نقاط الخصم المتبقية في يد ({roundWinner === 'team1' ? activeGame.team2.name : activeGame.team1.name}):
                </Text>
                
                <View style={styles.scoreInputRow}>
                  {/* زر الكاميرا لمسح يد الخصم المتبقية */}
                  <TouchableOpacity 
                    style={styles.scanInputBtn} 
                    onPress={handleScanLosingPoints}
                  >
                    <Ionicons name="camera" size={20} color="#00ffcc" />
                    <Text style={styles.scanInputBtnText}>مسح يد الخصم بالكاميرا</Text>
                  </TouchableOpacity>

                  {/* لوحة أزرار النقاط السريعة (One-Tap Points Grid) */}
                  <Text style={styles.quickGridLabel}>النقاط السريعة بالبنوط (نقرة واحدة):</Text>
                  <View style={styles.quickPointsGrid}>
                    {[10, 15, 20, 30, 40, 50, 60].map((val) => (
                      <TouchableOpacity
                        key={`preset-${val}`}
                        style={[styles.presetBtn, parseInt(losingPoints) === val && styles.activePresetBtn]}
                        onPress={() => setLosingPoints(val.toString())}
                      >
                        <Text style={[styles.presetBtnText, parseInt(losingPoints) === val && styles.activePresetBtnText]}>
                          {val} ن
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={styles.manualInputWrapper}>
                    <TextInput
                      style={styles.scoreTextInput}
                      value={losingPoints}
                      onChangeText={setLosingPoints}
                      placeholder="مثال: 45"
                      placeholderTextColor="#666"
                      keyboardType="numeric"
                      textAlign="center"
                    />
                    <Text style={styles.manualInputLabel}>أو كتابة يدوية دقيقة:</Text>
                  </View>
                </View>

                {/* توضيح قانون النزول والتقريب */}
                <View style={styles.ruleNoticeBox}>
                  <Ionicons name="information-circle-outline" size={16} color="#00ffcc" style={{ marginLeft: 6 }} />
                  <Text style={styles.ruleNoticeText}>
                    * نقاط الخصم الفردية تقرب لعشرة أدنى (45 تضاف 40، 19 تضاف 10).
                    {'\n'}
                    * النزول: أول إضافة يجب أن تكون 20 نقطة أو أكثر.
                  </Text>
                </View>

                {/* أزرار الحفظ والإلغاء */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.modalCancelBtn]}
                    onPress={() => setShowAddRoundModal(false)}
                  >
                    <Text style={styles.modalCancelBtnText}>إلغاء</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.modalActionBtn, styles.modalSaveBtn]}
                    onPress={submitRound}
                  >
                    <Text style={styles.modalSaveBtnText}>حفظ النقاط</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  contentContainer: {
    padding: 16,
    paddingTop: 60,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginTop: 40,
  },
  dominoIconWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.2)',
  },
  welcomeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  welcomeDesc: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  primaryBtn: {
    flexDirection: 'row-reverse',
    backgroundColor: '#00ffcc',
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryBtnText: {
    color: '#121212',
    fontSize: 16,
    fontWeight: 'bold',
  },
  setupCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  sectionTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 22,
    textAlign: 'center',
  },
  teamSetupBlock: {
    marginBottom: 20,
    backgroundColor: '#262626',
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#363636',
  },
  teamHeaderLabel: {
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  playersInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playerInputHalf: {
    flex: 0.48,
    marginBottom: 0,
  },
  setupActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  secondaryBtn: {
    flex: 0.45,
    borderWidth: 1,
    borderColor: '#444',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#aaa',
    fontSize: 15,
  },
  primaryBtnSmall: {
    flex: 0.5,
    backgroundColor: '#00ffcc',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnTextSmall: {
    color: '#121212',
    fontSize: 15,
    fontWeight: 'bold',
  },
  gameContainer: {
    width: '100%',
  },
  scoreboardCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    alignItems: 'center',
    marginBottom: 20,
  },
  targetLimitText: {
    color: '#888',
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  vsScoresRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
  },
  teamScoreCol: {
    alignItems: 'center',
    flex: 0.45,
  },
  teamScoreName: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  teamPlayersText: {
    color: '#888',
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
  },
  bigScoreText: {
    color: '#fff',
    fontSize: 50,
    fontWeight: 'bold',
    marginTop: 10,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  badgeOpen: {
    backgroundColor: 'rgba(52, 199, 89, 0.15)',
  },
  badgeClosed: {
    backgroundColor: 'rgba(255, 59, 48, 0.15)',
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  vsSpacer: {
    alignItems: 'center',
    flex: 0.1,
  },
  vsText: {
    color: '#666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vsLine: {
    height: 35,
    width: 1.5,
    backgroundColor: '#3a3a3a',
    marginTop: 8,
  },
  teamsProgressContainer: {
    width: '100%',
    marginTop: 20,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressPercent: {
    color: '#888',
    fontSize: 11,
  },
  doubleProgressBar: {
    height: 8,
    backgroundColor: '#2a2a2a',
    borderRadius: 4,
    flexDirection: 'row-reverse',
    overflow: 'hidden',
    position: 'relative',
  },
  barHalf: {
    height: '100%',
    position: 'absolute',
    borderRadius: 4,
  },
  barRight: {
    right: 0,
  },
  barLeft: {
    left: 0,
  },
  chartContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 20,
    alignItems: 'center',
  },
  chartTitle: {
    color: '#aaa',
    fontSize: 13,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyChartContainer: {
    backgroundColor: '#1e1e1e',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    marginBottom: 20,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
  },
  emptyChartText: {
    color: '#666',
    fontSize: 12,
  },
  chartLegend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  legendIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendText: {
    color: '#aaa',
    fontSize: 10,
  },
  actionRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  actionBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    flex: 0.48,
    borderWidth: 1,
  },
  undoBtn: {
    borderColor: '#ffcc00',
    backgroundColor: 'rgba(255, 204, 0, 0.08)',
  },
  newRoundBtn: {
    backgroundColor: '#00ffcc',
    borderColor: '#00ffcc',
  },
  disabledBtn: {
    borderColor: '#444',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
  },
  actionBtnText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  endGameBtn: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ff3b30',
    paddingVertical: 12,
    borderRadius: 14,
    flex: 1,
  },
  endGameBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  roundsCard: {
    backgroundColor: '#1e1e1e',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  roundsCardTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'right',
  },
  emptyRoundsText: {
    color: '#666',
    textAlign: 'center',
    fontSize: 13,
    paddingVertical: 20,
    lineHeight: 18,
  },
  roundRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: '#2a2a2a',
    paddingVertical: 12,
  },
  roundNumber: {
    color: '#00ffcc',
    fontSize: 13,
    fontWeight: 'bold',
    flex: 0.25,
    textAlign: 'right',
  },
  roundScoreDetails: {
    flex: 0.75,
    alignItems: 'flex-start',
  },
  roundWinnerDetailText: {
    color: '#ddd',
    fontSize: 13,
  },
  winnerTeamHighlight: {
    color: '#00ffcc',
    fontWeight: 'bold',
  },
  winnerTeamHighlight2: {
    color: '#ffd700',
    fontWeight: 'bold',
  },
  pointsHighlight: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#1e1e1e',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: '#2a2a2a',
    maxHeight: '90%',
  },
  modalTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalSectionLabel: {
    color: '#aaa',
    fontSize: 13,
    marginTop: 14,
    marginBottom: 8,
    textAlign: 'right',
  },
  teamWinnerSelector: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  teamWinnerOpt: {
    flex: 0.48,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2a2a2a',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  teamWinnerOptActive: {
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderColor: '#00ffcc',
  },
  teamWinnerOptText: {
    color: '#ccc',
    fontSize: 13,
    fontWeight: '500',
  },
  teamWinnerOptTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  scoreInputRow: {
    backgroundColor: '#262626',
    borderRadius: 16,
    padding: 16,
    marginVertical: 6,
    borderWidth: 1,
    borderColor: '#363636',
  },
  scanInputBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
    borderColor: '#00ffcc',
    borderWidth: 1,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 15,
  },
  scanInputBtnText: {
    color: '#00ffcc',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  quickGridLabel: {
    color: '#888',
    fontSize: 11,
    marginBottom: 8,
    textAlign: 'right',
  },
  quickPointsGrid: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  presetBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#3a3a3a',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    width: '23%',
    alignItems: 'center',
    marginVertical: 4,
  },
  activePresetBtn: {
    backgroundColor: 'rgba(0, 255, 204, 0.15)',
    borderColor: '#00ffcc',
  },
  presetBtnText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: 'bold',
  },
  activePresetBtnText: {
    color: '#00ffcc',
  },
  manualInputWrapper: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderColor: '#333',
    paddingTop: 12,
  },
  manualInputLabel: {
    color: '#bbb',
    fontSize: 13,
  },
  scoreTextInput: {
    width: 80,
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    paddingVertical: 8,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    borderWidth: 1,
    borderColor: '#3a3a3a',
  },
  ruleNoticeBox: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 204, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 204, 0.15)',
    borderRadius: 12,
    padding: 10,
    marginTop: 10,
  },
  ruleNoticeText: {
    color: '#aaa',
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'right',
    flex: 1,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 25,
    borderTopWidth: 1,
    borderColor: '#2a2a2a',
    paddingTop: 16,
  },
  modalActionBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.48,
  },
  modalCancelBtn: {
    borderWidth: 1,
    borderColor: '#444',
  },
  modalCancelBtnText: {
    color: '#aaa',
    fontSize: 14,
  },
  modalSaveBtn: {
    backgroundColor: '#00ffcc',
  },
  modalSaveBtnText: {
    color: '#121212',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
