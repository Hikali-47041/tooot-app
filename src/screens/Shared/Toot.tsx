import React from 'react'

import Timeline from '@components/Timelines/Timeline'

export interface Props {
  route: {
    params: {
      toot: Mastodon.Status
    }
  }
}

const ScreenSharedToot: React.FC<Props> = ({
  route: {
    params: { toot }
  }
}) => {
  return <Timeline page='Toot' toot={toot.id} disableRefresh disableInfinity />
}

export default ScreenSharedToot
