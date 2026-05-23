import React from 'react'
import { View, ActivityIndicator, Text } from 'react-native'
//using default react spinner can be changed to a better one later
const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <ActivityIndicator size="large" color="#3b82f6" />

      <Text
        style={{
          marginTop: 12,
          fontSize: 16,
          color: '#6b7280',
        }}
      >
        {text}
      </Text>
    </View>
  )
}

export default LoadingSpinner