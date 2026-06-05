import React, { useContext, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { AppContext } from '../context/AppContext';

// ─── Notification data ───────────────────────────────────────────────────────

const CRITICAL_ITEMS = [
  {
    id: 'c1',
    icon: '⚡',
    title: 'Turn off electricity',
    body: 'Switch off electricity at the breaker panel before flood water enters your home.',
  },
  {
    id: 'c2',
    icon: '🔧',
    title: 'Know your shut-off valves',
    body: 'Locate and know how to operate shut-off valves for water, gas, and major appliances.',
  },
  {
    id: 'c3',
    icon: '📦',
    title: 'Move electronics & documents',
    body: 'Move electronics away from water, tarp furniture, and store important documents in waterproof containers.',
  },
  {
    id: 'c4',
    icon: '💨',
    title: 'Dry area to prevent mold',
    body: 'Use fans and dehumidifiers to dry the affected area immediately after water recedes.',
  },
  {
    id: 'c5',
    icon: '📸',
    title: 'Take photos for insurance',
    body: 'Document all damage with timestamped photos before removing any water or debris.',
  },
  {
    id: 'c6',
    icon: '📞',
    title: 'Contact local authorities',
    body: 'Report flooding to local municipality and contact your insurance provider promptly.',
  },
  {
    id: 'c7',
    icon: '🏠',
    title: 'Check appliances & systems',
    body: 'Ensure all appliances and home systems are professionally inspected before use.',
  },
];

const CHECKLIST_ITEMS = [
  {
    id: 'p1',
    icon: '📦',
    title: 'Keep valuables out of basement',
    body: 'Store important items on upper floors or elevated shelves.',
  },
  {
    id: 'p2',
    icon: '🚫',
    title: "Don't pour fats, oils, grease down drains",
    body: 'These clog sewer systems and increase flood risk during heavy rainfall.',
  },
  {
    id: 'p3',
    icon: '⬆️',
    title: 'Raise large appliances above flood levels',
    body: 'Elevate furnaces, water heaters, and washers above anticipated flood levels.',
  },
  {
    id: 'p4',
    icon: '🏗️',
    title: 'Use water-resistant materials below ground',
    body: 'Use water-resistant building materials in all below-ground areas.',
  },
  {
    id: 'p5',
    icon: '🌊',
    title: 'Clear nearby city storm drains',
    body: 'Remove debris from storm drains near your property before a storm.',
  },
  {
    id: 'p6',
    icon: '💧',
    title: 'Direct downspouts away from home',
    body: 'Ensure downspouts extend at least 2 m from the foundation, draining away from your home and neighbours.',
  },
  {
    id: 'p7',
    icon: '🔩',
    title: 'Maintain eavestroughs & downspouts',
    body: 'Clean eavestroughs at least twice a year to prevent overflow.',
  },
  {
    id: 'p8',
    icon: '📐',
    title: 'Ensure proper grading',
    body: 'Ground should slope away from the foundation at a rate of 5 cm per 1 m.',
  },
  {
    id: 'p9',
    icon: '❄️',
    title: 'Keep snow away from foundation',
    body: 'Clear snow accumulation from around the foundation to prevent melt-water intrusion.',
  },
  {
    id: 'p10',
    icon: '🪣',
    title: 'Have sandbags ready',
    body: 'Store sandbags that can be deployed quickly at entryways and window wells.',
  },
  {
    id: 'p11',
    icon: '🪟',
    title: 'Window & door sealing tape',
    body: 'Use water-barrier tape on doors and window frames as a temporary flood shield.',
  },
];

const RECOMMENDED_ITEMS = [
  {
    id: 'r1',
    icon: '⚙️',
    title: 'Install a sump pump',
    body: 'A sump pump in the basement automatically removes water that accumulates.',
  },
  {
    id: 'r2',
    icon: '🔀',
    title: 'Install a backwater valve',
    body: 'Prevents sewer backup into your home during heavy rainfall. Check with your municipality for subsidies.',
    tag: '📍 Municipality-dependent',
  },
  {
    id: 'r3',
    icon: '🛡️',
    title: 'Install flood shields or barriers',
    body: 'Deploy removable flood barriers at ground-level doors and window openings.',
  },
  {
    id: 'r4',
    icon: '🌿',
    title: 'Plant soil-erosion resistant plants',
    body: 'Deep-rooted plants along your property perimeter reduce erosion during heavy rain.',
  },
  {
    id: 'r5',
    icon: '🔥',
    title: 'Insulate pipes well',
    body: 'Well-insulated pipes prevent burst pipes from contributing to water damage in winter.',
  },
  {
    id: 'r6',
    icon: '🪵',
    title: "Don't use carpet in storage areas",
    body: 'Replace basement or storage area carpets with tile or sealed concrete to prevent mold.',
  },
  {
    id: 'r7',
    icon: '💡',
    title: 'Raise water heaters above flood level',
    body: 'Elevate water heaters on a raised platform in the utility room.',
  },
  {
    id: 'r8',
    icon: '🌧️',
    title: 'Reduce water use during heavy rain',
    body: 'Limit showers, laundry, and toilet flushes to reduce sewer load during storms.',
    tag: '📍 Weather-dependent',
  },
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionHeader({ label, color, count }) {
  return (
    <View style={[styles.sectionHeader, { borderLeftColor: color }]}>
      <Text style={[styles.sectionTitle, { color }]}>{label}</Text>
      {count != null && (
        <View style={[styles.sectionBadge, { backgroundColor: color + '22', borderColor: color }]}>
          <Text style={[styles.sectionBadgeText, { color }]}>{count}</Text>
        </View>
      )}
    </View>
  );
}

function AlertCard({ item, accentColor }) {
  return (
    <View style={[styles.alertCard, { borderLeftColor: accentColor }]}>
      <Text style={styles.alertIcon}>{item.icon}</Text>
      <View style={styles.alertBody}>
        <Text style={styles.alertTitle}>{item.title}</Text>
        <Text style={styles.alertDesc}>{item.body}</Text>
        {item.tag && (
          <View style={styles.tagPill}>
            <Text style={styles.tagText}>{item.tag}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

function ChecklistCard({ item, checked, onToggle }) {
  return (
    <TouchableOpacity
      style={[styles.checklistCard, checked && styles.checklistCardDone]}
      onPress={onToggle}
      activeOpacity={0.75}
    >
      <View style={[styles.checkBox, checked && styles.checkBoxDone]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <View style={styles.checklistContent}>
        <Text style={[styles.checklistTitle, checked && styles.checklistTitleDone]}>
          {item.icon}  {item.title}
        </Text>
        {!checked && (
          <Text style={styles.checklistDesc}>{item.body}</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function NotificationsScreen() {
  const { activeAlerts, userProfile } = useContext(AppContext);
  const [checked, setChecked] = useState({});

  const toggleItem = (id) => setChecked(prev => ({ ...prev, [id]: !prev[id] }));

  const checkedCount = Object.values(checked).filter(Boolean).length;
  const totalChecklist = CHECKLIST_ITEMS.length;
  const progress = checkedCount / totalChecklist;

  const activeAlert = activeAlerts?.[0];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>

      {/* ── Weather banner ── */}
      {activeAlert && (
        <View style={styles.weatherBanner}>
          <View style={styles.weatherBannerLeft}>
            <Text style={styles.weatherBannerIcon}>⚠️</Text>
          </View>
          <View style={styles.weatherBannerBody}>
            <Text style={styles.weatherBannerTitle}>{activeAlert.title}</Text>
            <Text style={styles.weatherBannerSub}>{userProfile.location} · Tap an action below</Text>
          </View>
        </View>
      )}

      {/* ── Progress card ── */}
      <View style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <Text style={styles.progressTitle}>Preventative checklist</Text>
          <Text style={styles.progressCount}>
            {checkedCount} / {totalChecklist} done
          </Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        {checkedCount === totalChecklist && (
          <Text style={styles.progressComplete}>🎉 All preventative steps completed!</Text>
        )}
      </View>

      {/* ── Critical: During/After Flood ── */}
      <SectionHeader label="🔴  Critical — During & After Flood" color="#d32f2f" count={CRITICAL_ITEMS.length} />
      {CRITICAL_ITEMS.map(item => (
        <AlertCard key={item.id} item={item} accentColor="#d32f2f" />
      ))}

      {/* ── Yellow: Preventative checklist ── */}
      <SectionHeader label="🟡  Preventative Checklist" color="#f57c00" count={totalChecklist} />
      <Text style={styles.checklistHint}>Tap each item to mark it as done.</Text>
      {CHECKLIST_ITEMS.map(item => (
        <ChecklistCard
          key={item.id}
          item={item}
          checked={!!checked[item.id]}
          onToggle={() => toggleItem(item.id)}
        />
      ))}

      {/* ── Green: Long-term Recommendations ── */}
      <SectionHeader label="🟢  Recommended Improvements" color="#2e7d32" count={RECOMMENDED_ITEMS.length} />
      {RECOMMENDED_ITEMS.map(item => (
        <AlertCard key={item.id} item={item} accentColor="#2e7d32" />
      ))}

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4fb',
  },
  content: {
    paddingTop: Platform.OS === 'ios' ? 60 : 48,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },

  // Weather banner
  weatherBanner: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ffb74d',
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  weatherBannerLeft: { marginRight: 12 },
  weatherBannerIcon: { fontSize: 28 },
  weatherBannerBody: { flex: 1 },
  weatherBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#e65100',
    marginBottom: 3,
  },
  weatherBannerSub: {
    fontSize: 13,
    color: '#bf360c',
    opacity: 0.8,
  },

  // Progress
  progressCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#102a43',
  },
  progressCount: {
    fontSize: 13,
    color: '#627d98',
    fontWeight: '600',
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#e8edf2',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    backgroundColor: '#f57c00',
    borderRadius: 4,
  },
  progressComplete: {
    marginTop: 10,
    fontSize: 13,
    color: '#2e7d32',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginTop: 8,
    marginBottom: 10,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    flex: 1,
  },
  sectionBadge: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // Alert card (critical / recommended)
  alertCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderLeftWidth: 4,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'flex-start',
  },
  alertIcon: {
    fontSize: 22,
    marginRight: 12,
    marginTop: 1,
  },
  alertBody: { flex: 1 },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#102a43',
    marginBottom: 4,
  },
  alertDesc: {
    fontSize: 13,
    color: '#334e68',
    lineHeight: 19,
  },
  tagPill: {
    marginTop: 8,
    alignSelf: 'flex-start',
    backgroundColor: '#e8f0fe',
    borderRadius: 10,
    paddingHorizontal: 9,
    paddingVertical: 3,
  },
  tagText: {
    fontSize: 11,
    color: '#1a73e8',
    fontWeight: '600',
  },

  // Checklist hint
  checklistHint: {
    fontSize: 12,
    color: '#627d98',
    marginBottom: 10,
    marginLeft: 4,
    fontStyle: 'italic',
  },

  // Checklist card
  checklistCard: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#f57c00',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
    alignItems: 'flex-start',
  },
  checklistCardDone: {
    backgroundColor: '#f9fdf9',
    borderLeftColor: '#81c784',
    opacity: 0.8,
  },
  checkBox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#f57c00',
    marginRight: 12,
    marginTop: 1,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checkBoxDone: {
    backgroundColor: '#2e7d32',
    borderColor: '#2e7d32',
  },
  checkMark: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  checklistContent: { flex: 1 },
  checklistTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#102a43',
    marginBottom: 4,
  },
  checklistTitleDone: {
    color: '#627d98',
    textDecorationLine: 'line-through',
  },
  checklistDesc: {
    fontSize: 13,
    color: '#334e68',
    lineHeight: 19,
  },
});
