import { TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'
import { AlertTriangle } from 'react-feather'

export default function TokenRestrictionIcon({ restriction }: { restriction: TOKEN_RESTRICTION_TYPE | null }) {
  switch (restriction) {
    case TOKEN_RESTRICTION_TYPE.ACCREDITED_INVESTOR:
      return <AlertTriangle size="16px" />
    default:
      return null
  }
}
