import * as Location from 'expo-location';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface UVLevel {
  label: string;
  advice: string;
  bg: string;
  fg: string;
}

function getLevel(index: number): UVLevel {
  if (index <= 2) return { label: 'Low', advice: 'No protection needed', bg: '#2E7D32', fg: '#fff' };
  if (index <= 5) return { label: 'Moderate', advice: 'Wear sunscreen SPF 30+', bg: '#F9A825', fg: '#1a1a1a' };
  if (index <= 7) return { label: 'High', advice: 'Sunscreen, hat & shade', bg: '#E65100', fg: '#fff' };
  if (index <= 10) return { label: 'Very High', advice: 'Minimize sun exposure', bg: '#B71C1C', fg: '#fff' };
  return { label: 'Extreme', advice: 'Avoid going outdoors', bg: '#4A148C', fg: '#fff' };
}

async function getCityName(lat: number, lon: number): Promise<string> {
  if (Platform.OS !== 'web') {
    try {
      const [geo] = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lon });
      return geo?.city || geo?.region || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    } catch {
      return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    }
  }
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    const data = await res.json();
    return data.city || data.principalSubdivision || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  } catch {
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  }
}

export default function HomeScreen() {
  const [uvIndex, setUVIndex] = useState<number | null>(null);
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location access denied.\nPlease enable it in Settings.');
        return;
      }

      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const { latitude, longitude } = pos.coords;

      const [uvRes, name] = await Promise.all([
        fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=uv_index&timezone=auto`
        ),
        getCityName(latitude, longitude),
      ]);

      const uvData = await uvRes.json();
      setUVIndex(Math.round(uvData.current.uv_index));
      setCity(name);
    } catch {
      setError('Could not fetch UV data.\nCheck your connection and try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF9800" />
        <Text style={styles.loadingText}>Finding your sun...</Text>
        <StatusBar style="light" />
      </View>
    );
  }

  if (error || uvIndex === null) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorIcon}>☁️</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={load}>
          <Text style={styles.retryLabel}>Try Again</Text>
        </TouchableOpacity>
        <StatusBar style="light" />
      </View>
    );
  }

  const level = getLevel(uvIndex);
  const statusStyle = level.fg === '#fff' ? 'light' : 'dark';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: level.bg }]}>
      <StatusBar style={statusStyle} />
      <View style={styles.content}>
        <Text style={[styles.appName, { color: level.fg }]}>Ma Haindex?</Text>

        {city ? (
          <Text style={[styles.city, { color: level.fg }]}>
            {'\u{1F4CD}'} {city}
          </Text>
        ) : null}

        <View style={styles.indexBox}>
          <Text style={[styles.uvNumber, { color: level.fg }]}>{uvIndex}</Text>
          <Text style={[styles.uvLabel, { color: level.fg }]}>UV Index</Text>
        </View>

        <Text style={[styles.levelText, { color: level.fg }]}>{level.label}</Text>
        <Text style={[styles.adviceText, { color: level.fg }]}>{level.advice}</Text>

        <TouchableOpacity
          style={[styles.refreshBtn, { borderColor: level.fg }]}
          onPress={load}
          activeOpacity={0.7}
        >
          <Text style={[styles.refreshLabel, { color: level.fg }]}>Refresh</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 8,
  },
  appName: {
    fontSize: 26,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  city: {
    fontSize: 15,
    opacity: 0.85,
    marginBottom: 40,
  },
  indexBox: {
    alignItems: 'center',
    marginBottom: 8,
  },
  uvNumber: {
    fontSize: 128,
    fontWeight: '900',
    lineHeight: 128,
  },
  uvLabel: {
    fontSize: 18,
    fontWeight: '500',
    opacity: 0.75,
    marginTop: 4,
  },
  levelText: {
    fontSize: 34,
    fontWeight: '700',
    marginTop: 20,
  },
  adviceText: {
    fontSize: 15,
    opacity: 0.85,
    marginBottom: 48,
  },
  refreshBtn: {
    paddingHorizontal: 36,
    paddingVertical: 12,
    borderRadius: 28,
    borderWidth: 1.5,
    marginTop: 8,
  },
  refreshLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  center: {
    flex: 1,
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 32,
  },
  loadingText: {
    color: '#ccc',
    fontSize: 17,
  },
  errorIcon: {
    fontSize: 64,
  },
  errorText: {
    color: '#eee',
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 26,
  },
  retryBtn: {
    backgroundColor: '#FF9800',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 28,
    marginTop: 8,
  },
  retryLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
