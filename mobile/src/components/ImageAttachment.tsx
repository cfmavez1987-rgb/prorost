import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import * as ImagePickerLib from 'expo-image-picker';
import { colors, fontSize, radius, spacing } from '../theme';

interface ImageAttachmentProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export function ImageAttachment({ images, onChange, maxImages = 4 }: ImageAttachmentProps) {
  async function pickImage() {
    if (images.length >= maxImages) {
      Alert.alert('Лимит', `Можно прикрепить не более ${maxImages} изображений`);
      return;
    }

    const { status } = await ImagePickerLib.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нужно разрешение', 'Дайте доступ к галерее для прикрепления фото');
      return;
    }

    const result = await ImagePickerLib.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange([...images, result.assets[0].uri]);
    }
  }

  async function takePhoto() {
    if (images.length >= maxImages) {
      Alert.alert('Лимит', `Можно прикрепить не более ${maxImages} изображений`);
      return;
    }

    const { status } = await ImagePickerLib.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нужно разрешение', 'Дайте доступ к камере для съёмки фото');
      return;
    }

    const result = await ImagePickerLib.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      onChange([...images, result.assets[0].uri]);
    }
  }

  function removeImage(index: number) {
    onChange(images.filter((_, i) => i !== index));
  }

  function showAddOptions() {
    Alert.alert('Добавить фото', 'Откуда взять изображение?', [
      { text: 'Галерея', onPress: pickImage },
      { text: 'Камера', onPress: takePhoto },
      { text: 'Отмена', style: 'cancel' },
    ]);
  }

  return (
    <View style={styles.wrapper}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
        {images.map((uri, index) => (
          <View key={index} style={styles.imageWrapper}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.removeBtn}
              onPress={() => removeImage(index)}
              activeOpacity={0.7}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        ))}
        {images.length < maxImages && (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={showAddOptions}
            activeOpacity={0.7}
          >
            <Text style={styles.addIcon}>📷</Text>
            <Text style={styles.addText}>Добавить</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
      <Text style={styles.hint}>
        {images.length}/{maxImages} фото
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: spacing.md,
  },
  scroll: {
    flexDirection: 'row',
  },
  imageWrapper: {
    position: 'relative',
    marginRight: spacing.sm,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: radius.sm,
    backgroundColor: colors.ghost,
  },
  removeBtn: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  addBtn: {
    width: 100,
    height: 100,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.ghost,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  addIcon: {
    fontSize: 24,
  },
  addText: {
    fontSize: fontSize.xs,
    color: colors.slate,
    fontWeight: '500',
  },
  hint: {
    fontSize: fontSize.xs,
    color: colors.slate,
    marginTop: spacing.xs,
  },
});
