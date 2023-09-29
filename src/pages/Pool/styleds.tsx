import { LoadingRows as BaseLoadingRows } from 'components/Loader/styled'
import styled from 'styled-components/macro'

// export const Wrapper = styled.div`
//   position: relative;
//   padding: 20px;
// `

// export const ClickableText = styled(Text)`
//   :hover {
//     cursor: pointer;
//   }
//   color: ${({ theme }) => theme.accentAction};
// `
export const MaxButton = styled.button<{ width: string }>`
  padding: 0.5rem 1rem;
  background-color: ${({ theme }) => theme.accentActionSoft};
  border: 1px solid ${({ theme }) => theme.accentAction};
  border-radius: 0.5rem;
  font-size: 1rem;
  ${({ theme }) => theme.deprecated_mediaWidth.deprecated_upToSmall`
    padding: 0.25rem 0.5rem;
  `};
  font-weight: 500;
  cursor: pointer;
  margin: 0.25rem;
  overflow: hidden;
  color: ${({ theme }) => theme.accentAction};
  :hover {
    border: 1px solid ${({ theme }) => theme.accentAction};
  }
  :focus {
    border: 1px solid ${({ theme }) => theme.accentAction};
    outline: none;
  }
`

export const Dots = styled.span`
  &::after {
    display: inline-block;
    animation: ellipsis 1.25s infinite;
    content: '.';
    width: 1em;
    text-align: left;
  }
  @keyframes ellipsis {
    0% {
      content: '.';
    }
    33% {
      content: '..';
    }
    66% {
      content: '...';
    }
  }
`

export const LoadingRows = styled(BaseLoadingRows)`
  padding: 1rem;
  padding-bottom: 0;
  min-width: 75%;
  max-width: 960px;
  grid-column-gap: 0.5em;
  grid-row-gap: 0.8em;
  grid-template-columns: repeat(3, 1fr);

  & > div:nth-child(4n + 1) {
    grid-column: 1 / 3;
  }
  & > div:nth-child(4n) {
    grid-column: 3 / 4;
    margin-bottom: 2em;
  }
`
