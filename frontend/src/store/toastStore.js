import { create } from 'zustand'

let toastTimeout
//basic toast implementation
const useToastStore = create((set) => ({
  visible: false,
  message: '',
  type: 'info',

  showToast: (message, type = 'info') => {
    clearTimeout(toastTimeout)

    set({
      visible: true,
      message,
      type,
    })

    toastTimeout = setTimeout(() => {
      set({
        visible: false,
        message: '',
      })
    }, 3000)
  },

  hideToast: () =>
    set({
      visible: false,
      message: '',
    }),
}))

export default useToastStore