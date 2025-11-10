import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { debounce } from 'lodash';
import { useAppStore } from '@/state/store';
import { ApiService } from '@/services/api';
import { SearchResult } from '@/types';
import { normalizeQuery, extractNafdacRegNo } from '@/utils/format';
import { getButtonAccessibilityHint } from '@/utils/a11y';

type SearchScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Search'>;

interface Props {
  navigation: SearchScreenNavigationProp;
}

export default function SearchScreen({ navigation }: Props): React.JSX.Element {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const { setVerifying, addRecentLookup } = useAppStore();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setHasSearched(false);
        return;
      }

      setIsSearching(true);
      setHasSearched(true);

      try {
        const results = await ApiService.search(searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
        Alert.alert('Search Error', 'Failed to search medicines. Please try again.');
      } finally {
        setIsSearching(false);
      }
    }, 500),
    []
  );

  const handleQueryChange = (text: string) => {
    setQuery(text);
    debouncedSearch(text);
  };

  const handleSelectResult = async (result: SearchResult) => {
    setVerifying(true);
    
    try {
      const response = await ApiService.verify({
        name: result.title,
        regNo: result.regNo,
      });

      addRecentLookup(response.product);
      setVerifying(false);
      
      navigation.navigate('Results', { lookupId: response.product.id });
    } catch (error) {
      setVerifying(false);
      Alert.alert('Verification Error', 'Failed to verify medicine. Please try again.');
    }
  };

  const handleQuickVerify = async () => {
    if (!query.trim()) {
      Alert.alert('Invalid Input', 'Please enter a medicine name or NAFDAC registration number.');
      return;
    }

    setVerifying(true);

    try {
      // Extract registration number if present
      const regNo = extractNafdacRegNo(query);
      const verifyRequest = {
        name: regNo ? null : query,
        regNo: regNo || undefined,
      };

      const response = await ApiService.verify(verifyRequest);
      addRecentLookup(response.product);
      setVerifying(false);
      
      navigation.navigate('Results', { lookupId: response.product.id });
    } catch (error) {
      setVerifying(false);
      Alert.alert('Verification Error', 'Failed to verify medicine. Please try again.');
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Text style={styles.label}>Medicine Name or NAFDAC Reg. No.</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={handleQueryChange}
            placeholder="e.g., Paracetamol or NAFDAC Reg. No.: 04-1234"
            placeholderTextColor="#9ca3af"
            autoCapitalize="words"
            autoCorrect={false}
            multiline={false}
            accessible={true}
            accessibilityLabel="Medicine search input"
            accessibilityHint="Enter medicine name or NAFDAC registration number"
          />
          {query.length > 0 && (
            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, !query.trim() && styles.verifyButtonDisabled]}
          onPress={handleQuickVerify}
          disabled={!query.trim() || isSearching}
          accessible={true}
          accessibilityLabel="Quick verify medicine"
          accessibilityHint={getButtonAccessibilityHint('verify')}
        >
          <Text style={styles.verifyButtonText}>
            {isSearching ? 'Verifying...' : 'Quick Verify'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Results */}
      {isSearching && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>Searching medicines...</Text>
        </View>
      )}

      {!isSearching && hasSearched && (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            Search Results {searchResults.length > 0 && `(${searchResults.length})`}
          </Text>
          
          {searchResults.length === 0 ? (
            <View style={styles.noResults}>
              <Text style={styles.noResultsText}>
                No medicines found for "{query}"
              </Text>
              <Text style={styles.noResultsHint}>
                Try checking the spelling or use the Quick Verify button above
              </Text>
            </View>
          ) : (
            searchResults.map((result) => (
              <TouchableOpacity
                key={result.id}
                style={styles.resultItem}
                onPress={() => handleSelectResult(result)}
                accessible={true}
                accessibilityLabel={`Select ${result.title}`}
                accessibilityHint={`Double tap to verify ${result.title}`}
              >
                <View style={styles.resultContent}>
                  <Text style={styles.resultTitle}>{result.title}</Text>
                  
                  {result.regNo && (
                    <Text style={styles.resultRegNo}>Reg. No: {result.regNo}</Text>
                  )}
                  
                  {result.manufacturer && (
                    <Text style={styles.resultManufacturer}>{result.manufacturer}</Text>
                  )}
                  
                  {result.category && (
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryText}>{result.category}</Text>
                    </View>
                  )}
                </View>
                
                <Text style={styles.resultArrow}>›</Text>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* Search Tips */}
      <View style={styles.tipsContainer}>
        <Text style={styles.tipsTitle}>Search Tips:</Text>
        <Text style={styles.tipText}>• Enter the exact medicine name</Text>
        <Text style={styles.tipText}>• Use NAFDAC Reg. No. format: XX-XXXX</Text>
        <Text style={styles.tipText}>• Partial names work for searching</Text>
        <Text style={styles.tipText}>• Quick Verify works with names or reg. numbers</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  searchContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 12,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: '#ffffff',
    paddingRight: 40,
  },
  clearButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    marginTop: -12,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  verifyButton: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  verifyButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  verifyButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  resultsContainer: {
    marginBottom: 24,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  noResultsHint: {
    fontSize: 14,
    color: '#9ca3af',
    textAlign: 'center',
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  resultRegNo: {
    fontSize: 14,
    color: '#059669',
    fontWeight: '500',
    marginBottom: 2,
  },
  resultManufacturer: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  categoryText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  resultArrow: {
    fontSize: 24,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  tipsContainer: {
    backgroundColor: '#f0f9ff',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 16,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: '#1e40af',
    marginBottom: 4,
  },
});