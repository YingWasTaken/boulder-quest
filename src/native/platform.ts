import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { Filesystem, Directory } from '@capacitor/filesystem'
import { Share } from '@capacitor/share'
import { handleBack } from './back'

export const isNative = Capacitor.isNativePlatform()

/** Wires the Android back button to the screen or dialog on top. */
export function initNative() {
  if (!isNative) return
  App.addListener('backButton', () => {
    if (!handleBack()) App.minimizeApp()
  })
}

export function haptic(kind: 'success' | 'fail' | 'tap') {
  if (isNative) {
    if (kind === 'fail') Haptics.notification({ type: NotificationType.Error }).catch(() => {})
    else Haptics.impact({ style: kind === 'tap' ? ImpactStyle.Light : ImpactStyle.Medium }).catch(() => {})
    return
  }
  const pattern = kind === 'fail' ? [80, 40, 80] : kind === 'tap' ? 10 : 50
  navigator.vibrate?.(pattern)
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result).split(',')[1] ?? '')
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

/** Opens the system share sheet with the image, or downloads it on the web. */
export async function shareImage(blob: Blob, fileName: string, title: string) {
  if (isNative) {
    const { uri } = await Filesystem.writeFile({
      path: fileName,
      data: await blobToBase64(blob),
      directory: Directory.Cache,
    })
    await Share.share({ title, files: [uri] })
    return
  }

  const file = new File([blob], fileName, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title })
    return
  }
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.download = fileName
  link.href = url
  link.click()
  URL.revokeObjectURL(url)
}
