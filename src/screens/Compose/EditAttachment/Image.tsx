import CustomText from '@components/Text'
import { useAccessibility } from '@utils/accessibility/AccessibilityManager'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Dimensions, Image, View } from 'react-native'
import { Gesture, GestureDetector } from 'react-native-gesture-handler'
import Animated, {
  Extrapolate,
  interpolate,
  runOnJS,
  useAnimatedStyle,
  useSharedValue
} from 'react-native-reanimated'
import ComposeContext from '../utils/createContext'

export interface Props {
  index: number
}

const ComposeEditAttachmentImage: React.FC<Props> = ({ index }) => {
  const { t } = useTranslation('screenCompose')
  const { colors } = useTheme()
  const { screenReaderEnabled } = useAccessibility()

  const { composeState, composeDispatch } = useContext(ComposeContext)
  const theAttachmentRemote = composeState.attachments.uploads[index].remote!
  const theAttachmentLocal = composeState.attachments.uploads[index].local

  const windowWidth = Dimensions.get('window').width

  const imageWidthBase =
    theAttachmentRemote?.meta?.original?.aspect < 1
      ? windowWidth * theAttachmentRemote?.meta?.original?.aspect
      : windowWidth
  const imageDimensionis = {
    width: imageWidthBase,
    height:
      imageWidthBase /
      ((theAttachmentRemote as Mastodon.AttachmentImage)?.meta?.original?.aspect || 1)
  }

  const updateFocus = ({ x, y }: { x: number; y: number }) => {
    composeDispatch({
      type: 'attachment/edit',
      payload: {
        ...theAttachmentRemote,
        meta: {
          ...theAttachmentRemote.meta,
          focus: {
            x: x > 1 ? 1 : x,
            y: y > 1 ? 1 : y
          }
        }
      }
    })
  }

  const pan = useSharedValue({
    x:
      (((theAttachmentRemote as Mastodon.AttachmentImage)?.meta?.focus?.x || 0) *
        imageDimensionis.width) /
      2,
    y:
      (((theAttachmentRemote as Mastodon.AttachmentImage)?.meta?.focus?.y || 0) *
        imageDimensionis.height) /
      2
  })
  const start = useSharedValue({ x: 0, y: 0 })
  const gesture = Gesture.Pan()
    .onBegin(() => {
      start.value = pan.value
    })
    .onUpdate(e => {
      pan.value = {
        x: e.translationX + start.value.x,
        y: e.translationY + start.value.y
      }
    })
    .onEnd(() => {
      runOnJS(updateFocus)({
        x: pan.value.x / (imageDimensionis.width / 2),
        y: pan.value.y / (imageDimensionis.height / 2)
      })
    })
    .onFinalize(() => {
      start.value = pan.value
    })
  const styleTransform = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: interpolate(
            pan.value.x,
            [-imageDimensionis.width / 2, imageDimensionis.width / 2],
            [-imageDimensionis.width / 2, imageDimensionis.width / 2],
            Extrapolate.CLAMP
          )
        },
        {
          translateY: interpolate(
            pan.value.y,
            [-imageDimensionis.height / 2, imageDimensionis.height / 2],
            [-imageDimensionis.height / 2, imageDimensionis.height / 2],
            Extrapolate.CLAMP
          )
        }
      ]
    }
  })

  return (
    <>
      <View style={{ overflow: 'hidden', flex: 1, alignItems: 'center' }}>
        <Image
          style={{
            width: imageDimensionis.width,
            height: imageDimensionis.height
          }}
          source={{
            uri: theAttachmentLocal?.uri ? theAttachmentLocal.uri : theAttachmentRemote?.preview_url
          }}
        />
        <GestureDetector gesture={gesture}>
          <Animated.View
            style={[
              styleTransform,
              {
                width: windowWidth * 2,
                height: imageDimensionis.height * 2,
                position: 'absolute',
                left: -windowWidth / 2,
                top: -imageDimensionis.height / 2,
                backgroundColor: colors.backgroundOverlayInvert,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center'
              }
            ]}
            children={
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  borderWidth: 2,
                  borderColor: colors.primaryOverlay,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              />
            }
          />
        </GestureDetector>
      </View>
      {screenReaderEnabled ? null : (
        <CustomText
          fontStyle='M'
          style={{
            padding: StyleConstants.Spacing.Global.PagePadding,
            color: colors.primaryDefault
          }}
        >
          {t('content.editAttachment.content.imageFocus')}
        </CustomText>
      )}
    </>
  )
}

export default ComposeEditAttachmentImage
