import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
//very basic error page, could improve retry logic and add some graphics later
const PageError = ({
  message = 'Something went wrong',
  onRetry,
}) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
      }}
    >
      <Text
        style={{
          fontSize: 18,
          fontWeight: '600',
          marginBottom: 10,
          color: '#ef4444',
          textAlign: 'center',
        }}
      >
        {message}
      </Text>

      {onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          style={{
            marginTop: 10,
            backgroundColor: '#3b82f6',
            paddingHorizontal: 20,
            paddingVertical: 10,
            borderRadius: 8,
          }}
        >
          <Text
            style={{
              color: 'white',
              fontWeight: '600',
            }}
          >
            Retry
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

export default PageError