import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { colors, fontSize, radius, spacing } from '../theme';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  label?: string;
}

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = [0, 15, 30, 45];

function formatDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(d: Date): string {
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

export function DateTimePicker({ value, onChange, label }: DateTimePickerProps) {
  const [showModal, setShowModal] = useState(false);
  const [tempDate, setTempDate] = useState(value);
  const [step, setStep] = useState<'date' | 'time'>('date');

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Генерируем даты на 30 дней вперёд
  const dates = Array.from({ length: 30 }, (_, i) => addDays(today, i + 1));

  function handleDateSelect(date: Date) {
    setTempDate(date);
    setStep('time');
  }

  function handleTimeSelect(hour: number, minute: number) {
    const selected = new Date(tempDate);
    selected.setHours(hour, minute, 0, 0);
    onChange(selected);
    setShowModal(false);
    setStep('date');
  }

  function handleOpen() {
    setTempDate(value);
    setStep('date');
    setShowModal(true);
  }

  return (
    <View style={styles.wrapper}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TouchableOpacity style={styles.trigger} onPress={handleOpen} activeOpacity={0.7}>
        <View style={styles.triggerContent}>
          <View style={styles.triggerRow}>
            <Text style={styles.triggerIcon}>📅</Text>
            <View>
              <Text style={styles.triggerDate}>{formatDate(value)}</Text>
              <Text style={styles.triggerTime}>{formatTime(value)}</Text>
            </View>
          </View>
          <Text style={styles.triggerChange}>Изменить</Text>
        </View>
      </TouchableOpacity>

      <Modal visible={showModal} animationType="slide" transparent>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {step === 'date' ? 'Выберите дату' : 'Выберите время'}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={styles.closeBtn}>✕</Text>
              </TouchableOpacity>
            </View>

            {step === 'date' ? (
              <ScrollView style={styles.dateList}>
                {dates.map((date, i) => {
                  const selected = isSameDay(date, tempDate);
                  const weekday = date.toLocaleDateString('ru-RU', { weekday: 'short' });
                  return (
                    <TouchableOpacity
                      key={i}
                      style={[styles.dateItem, selected && styles.dateItemSelected]}
                      onPress={() => handleDateSelect(date)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dateWeekday, selected && styles.dateTextSelected]}>
                        {weekday}
                      </Text>
                      <Text style={[styles.dateDay, selected && styles.dateTextSelected]}>
                        {date.getDate()}
                      </Text>
                      <Text style={[styles.dateMonth, selected && styles.dateTextSelected]}>
                        {date.toLocaleDateString('ru-RU', { month: 'short' })}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            ) : (
              <ScrollView style={styles.timeList}>
                {HOURS.map(hour => (
                  <View key={hour} style={styles.timeRow}>
                    {MINUTES.map(minute => {
                      const selected = tempDate.getHours() === hour && tempDate.getMinutes() === minute;
                      return (
                        <TouchableOpacity
                          key={minute}
                          style={[styles.timeItem, selected && styles.timeItemSelected]}
                          onPress={() => handleTimeSelect(hour, minute)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.timeText, selected && styles.timeTextSelected]}>
                            {String(hour).padStart(2, '0')}:{String(minute).padStart(2, '0')}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                ))}
              </ScrollView>
            )}

            {step === 'time' && (
              <TouchableOpacity
                style={styles.backBtn}
                onPress={() => setStep('date')}
              >
                <Text style={styles.backBtnText}>← Выбрать другую дату</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.ink,
    marginBottom: spacing.xs,
  },
  trigger: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.ghost,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  triggerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  triggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  triggerIcon: {
    fontSize: 24,
  },
  triggerDate: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.ink,
  },
  triggerTime: {
    fontSize: fontSize.sm,
    color: colors.coral,
    fontWeight: '500',
  },
  triggerChange: {
    fontSize: fontSize.sm,
    color: colors.coral,
    fontWeight: '500',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: colors.paper,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    maxHeight: '70%',
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.ghost,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.ink,
  },
  closeBtn: {
    fontSize: 20,
    color: colors.slate,
    padding: spacing.xs,
  },
  dateList: {
    padding: spacing.md,
  },
  dateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    gap: spacing.md,
  },
  dateItemSelected: {
    backgroundColor: colors.coral,
  },
  dateWeekday: {
    fontSize: fontSize.sm,
    color: colors.slate,
    width: 40,
    textTransform: 'capitalize',
  },
  dateDay: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.ink,
    width: 36,
    textAlign: 'center',
  },
  dateMonth: {
    fontSize: fontSize.sm,
    color: colors.slate,
    textTransform: 'capitalize',
  },
  dateTextSelected: {
    color: colors.white,
  },
  timeList: {
    padding: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  timeItem: {
    flex: 1,
    padding: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.ghost,
    alignItems: 'center',
  },
  timeItemSelected: {
    backgroundColor: colors.coral,
    borderColor: colors.coral,
  },
  timeText: {
    fontSize: fontSize.sm,
    color: colors.ink,
    fontWeight: '500',
  },
  timeTextSelected: {
    color: colors.white,
  },
  backBtn: {
    padding: spacing.md,
    alignItems: 'center',
  },
  backBtnText: {
    fontSize: fontSize.sm,
    color: colors.coral,
    fontWeight: '500',
  },
});
