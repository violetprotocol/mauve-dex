import { AutoColumn } from 'components/Column'
import { getRestrictionCopy, TOKEN_RESTRICTION_TYPE } from 'constants/tokenRestrictions'
import { WARNING_LEVEL } from 'constants/tokenSafety'
import { useTokenWarningColor, useTokenWarningTextColor } from 'hooks/useTokenWarningColor'
import { Text } from 'rebass'
import styled from 'styled-components/macro'
import { ExternalLink } from 'theme'

import TokenRestrictionIcon from './TokenRestrictionIcon'

const Label = styled.div<{ color: string; backgroundColor: string }>`
  width: 100%;
  padding: 20px 20px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  border-radius: 16px;
  color: ${({ color }) => color};
`

const TitleRow = styled.div`
  align-items: center;
  font-weight: 700;
  display: inline-flex;
`

const Title = styled(Text)`
  font-weight: 600;
  font-size: 16px;
  line-height: 24px;
  margin-left: 7px;
`

const DetailsRow = styled.div`
  margin: 10px 10px;
  font-size: 12px;
  line-height: 16px;
  color: ${({ theme }) => theme.textSecondary};
`

const StyledLink = styled(ExternalLink)`
  background-color: ${({ theme }) => theme.accentWarning};
  border: 1px solid ${({ theme }) => theme.accentWarning};
  border-radius: ${20}px;
  color: ${({ theme }) => theme.textPrimary};
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  padding: 10px 16px;
  text-align: center;
`

type TokenRestrictionMessageProps = {
  restriction: TOKEN_RESTRICTION_TYPE
  content?: React.ReactElement
}

export default function TokenRestrictionMessage({ restriction, content }: TokenRestrictionMessageProps) {
  const backgroundColor = useTokenWarningColor(WARNING_LEVEL.MEDIUM)
  const textColor = useTokenWarningTextColor(WARNING_LEVEL.MEDIUM)
  const { heading, description, action, link } = getRestrictionCopy(restriction)

  return (
    <Label color={textColor} backgroundColor={backgroundColor}>
      <TitleRow>
        <TokenRestrictionIcon restriction={restriction} />
        <Title marginLeft="7px">{heading} </Title>
      </TitleRow>

      <DetailsRow>
        {Boolean(heading) && ' '}
        {description}
        {Boolean(description) && ' '}
      </DetailsRow>
      <AutoColumn>
        <StyledLink href={link ?? ''}>
          <>{action}</>
        </StyledLink>
      </AutoColumn>
      <AutoColumn>{content}</AutoColumn>
    </Label>
  )
}
