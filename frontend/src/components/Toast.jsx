import React from 'react'
import { View, Text } from 'react-native'
import useToastStore from '../store/toastStore'

const Toast = () => {
  const { visible, message, type } = useToastStore()

  if (!visible) return null
  //basic colour scheme might need to change based on overall look
  const backgroundColor =
    type === 'success'
      ? '#1cd861'
      : type === 'error'
      ? '#ef4444'
      : '#3b82f6'

  return (
    <View
      style={{
        position: 'absolute',
        top: 60,
        alignSelf: 'center',
        backgroundColor,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 10,
        zIndex: 9999,
        elevation: 10,
        maxWidth: '90%',
      }}
    >
      <Text
        style={{
          color: 'white',
          fontWeight: '600',
        }}
      >
        {message}
      </Text>
    </View>
  )
}

export default Toast