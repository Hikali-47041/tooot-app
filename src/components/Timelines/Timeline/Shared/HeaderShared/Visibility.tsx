import Icon from '@components/Icon'
import { StyleConstants } from '@utils/styles/constants'
import { useTheme } from '@utils/styles/ThemeManager'
import React from 'react'
import { StyleSheet } from 'react-native'

export interface Props {
  visibility?: Mastodon.Status['visibility']
}

const HeaderSharedVisibility: React.FC<Props> = ({ visibility }) => {
  const { theme } = useTheme()

  return visibility && visibility === 'private' ? (
    <Icon
      name='Lock'
      size={StyleConstants.Font.Size.S}
      color={theme.secondary}
      style={styles.visibility}
    />
  ) : null
}

const styles = StyleSheet.create({
  visibility: {
    marginLeft: StyleConstants.Spacing.S
  }
})

export default HeaderSharedVisibility
