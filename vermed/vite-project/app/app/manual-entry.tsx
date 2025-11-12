import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ManualEntryScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = () => {
    if (query.trim()) {
      setIsLoading(true);
      // Simulate search delay
      setTimeout(() => {
        router.push({
          pathname: '/result',
          params: { query: query.trim() }
        });
      }, 500);
    }
  };

  const quickExamples = [
    'PM500MBN2024001',
    '123456789001',
    'Paracetamol'
  ];

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Enter Serial Number</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Instructions */}
        <View style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>How to find serial number</Text>
          <Text style={styles.instructionItem}>• Check the medicine packaging</Text>
          <Text style={styles.instructionItem}>• Look for serial/barcode number</Text>
          <Text style={styles.instructionItem}>• Enter the complete number</Text>
          <Text style={styles.instructionItem}>• You can also search by medicine name</Text>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Text style={styles.label}>Serial Number, Barcode, or Medicine Name</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Enter serial number, barcode, or medicine name..."
              placeholderTextColor="#9ca3af"
              autoFocus
              returnKeyType="search"
              onSubmitEditing={handleSearch}
            />
            <Ionicons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          </View>

          <TouchableOpacity
            style={[styles.searchButton, (!query.trim() || isLoading) && styles.searchButtonDisabled]}
            onPress={handleSearch}
            disabled={!query.trim() || isLoading}
          >
            <Text style={styles.searchButtonText}>
              {isLoading ? 'Searching...' : 'Search Medicine'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Quick Examples */}
        <View style={styles.examplesContainer}>
          <Text style={styles.examplesTitle}>Quick Examples:</Text>
          {quickExamples.map((example) => (
            <TouchableOpacity
              key={example}
              style={styles.exampleButton}
              onPress={() => setQuery(example)}
            >
              <Text style={styles.exampleText}>{example}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tips */}
        <View style={styles.tipsCard}>
          <Text style={styles.tipsTitle}>Tips:</Text>
          <Text style={styles.tipItem}>• Use the exact serial number from packaging</Text>
          <Text style={styles.tipItem}>• Include all numbers and letters</Text>
          <Text style={styles.tipItem}>• Check for zero vs letter O</Text>
          <Text style={styles.tipItem}>• Take a clear photo if unsure</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#16a34a',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  instructionsCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  instructionItem: {
    fontSize: 14,
    color: '#1e3a8a',
    marginVertical: 2,
  },
  searchContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    paddingRight: 40,
    fontSize: 16,
    color: '#1f2937',
  },
  searchIcon: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  searchButton: {
    backgroundColor: '#16a34a',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  searchButtonDisabled: {
    backgroundColor: '#d1d5db',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  examplesContainer: {
    marginBottom: 32,
  },
  examplesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  exampleButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  exampleText: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: '#374151',
  },
  tipsCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  tipItem: {
    fontSize: 14,
    color: '#78350f',
    marginVertical: 2,
  },
});
