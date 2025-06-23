import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  TextInput, 
  StyleSheet, 
  TouchableOpacity, 
  Platform,
  I18nManager,
  ViewStyle,
  TextStyle,
  TextInputProps
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  placeholder?: string;
  value?: string;
  autoFocus?: boolean;
  inputProps?: TextInputProps;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  onCancel?(): void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onFocus,
  onBlur,
  placeholder = 'Search recipes...',
  value = '',
  autoFocus = false,
  inputProps,
  style,
  inputStyle,
  onCancel
}) => {
  const [query, setQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const handleChangeText = (text: string) => {
    setQuery(text);
    // Don't trigger search on every keystroke, let the parent handle debouncing
    onSearch(text);
  };

  const handleSubmit = () => {
    // Only submit if there's actual text (non-whitespace)
    if (query.trim()) {
      onSearch(query.trim());
    } else {
      // If empty, clear the search
      handleClear();
    }
  };

  const handleClear = () => {
    setQuery('');
    onSearch('');
    onCancel?.();
  };

  const handleCancelPress = () => {
    handleClear();
    inputRef.current?.blur();
  };

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
  };

  const handleBlur = () => {
    // Only blur if not clicking on the clear/cancel button
    if (!query) {
      setIsFocused(false);
      onBlur?.();
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.searchContainer,
          isFocused && styles.searchContainerFocused,
        ]}
      >
        <Ionicons
          name="search"
          size={20}
          color="#94A3B8"
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={[styles.input, inputStyle]}
          placeholder="Search Recipes…"
          placeholderTextColor="#94A3B8"
          value={query}
          onChangeText={handleChangeText}
          onSubmitEditing={handleSubmit}
          onFocus={handleFocus}
          onBlur={handleBlur}
          autoFocus={autoFocus}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          maxLength={30}
          blurOnSubmit={false}
          {...inputProps}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={handleCancelPress} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 15,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 20,
    paddingHorizontal: 12,
    height: 36,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0,
        shadowRadius: 0,
      },
      android: {
        elevation: 0,
      },
    }),
  },
  searchContainerFocused: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: '100%',
    fontSize: 14,
    color: '#1E293B',
    fontFamily: 'Inter_400Regular',
    padding: 0,
    margin: 0,
    textAlign: I18nManager.isRTL ? 'right' : 'left',
  },
  clearButton: {
    padding: 4,
    marginLeft: 4,
  },
});

export default React.memo(SearchBar);