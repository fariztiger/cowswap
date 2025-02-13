import React from 'react'
import { Code, MessageCircle /*PieChart*/ } from 'react-feather'

import MenuMod, { MenuItem, InternalMenuItem, MenuFlyout as MenuFlyoutUni } from './MenuMod'
import { useCloseModals } from 'state/application/hooks'
import styled from 'styled-components'
import { Separator as SeparatorBase } from 'components/swap/styleds'
import { CONTRACTS_CODE_LINK, DISCORD_LINK } from 'constants/index'
import GameIcon from 'assets/cow-swap/game.gif'

export const StyledMenu = styled(MenuMod)`
  hr {
    margin: 15px 0;
  }

  ${MenuItem},
  ${InternalMenuItem} {
    color: ${({ theme }) => theme.header.menuFlyout.color};
    background: ${({ theme }) => theme.header.menuFlyout.background};
    :hover {
      color: ${({ theme }) => theme.header.menuFlyout.colorHover};
      background: ${({ theme }) => theme.header.menuFlyout.colorHoverBg};
    }
  }

  span[aria-label='Play CowGame'] > img {
    width: 20px;
    height: 20px;
    object-fit: contain;
    padding: 0 4px 0 0;
  }
`

const Policy = styled(InternalMenuItem).attrs(attrs => ({
  ...attrs
}))`
  font-size: 0.8em;
  text-decoration: underline;
`

const MenuFlyout = styled(MenuFlyoutUni)`
  min-width: 11rem;
  box-shadow: 0 0 100vh 100vw rgb(0 0 0 / 25%);
  top: calc(100% + 16px);
  order: 1;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    top: initial;
    bottom: calc(100% + 32px);
  `}

  ${({ theme }) => theme.mediaWidth.upToSmall`
    top: 0;
    left: 0;
    position: fixed;
    height: 100vh;
    width: 100vw;
    border-radius: 0;
    box-shadow: none;
    padding: 0;
    overflow-y: auto;
  `};

  > a {
    transition: background 0.2s ease-in-out;
    display: flex;
    align-items: center;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      flex: 0 1 auto;
      padding: 16px;
      font-size: 18px;
        svg {
          width: 18px;
          height: 18px;
          object-fit: contain;
          margin: 0 8px 0 0;
        }
    `};

    > span {
      display: flex;
      align-items: center;
    }

    > span > svg {
      margin: 0 8px 0 0;
    }
  }
  > a:hover {
    background: ${({ theme }) => theme.disabled};
    border-radius: 6px;
  }
`

export const Separator = styled(SeparatorBase)`
  background-color: ${({ theme }) => theme.disabled};
  margin: 0.3rem auto;
  width: 90%;

  ${({ theme }) => theme.mediaWidth.upToMedium`
    width: 100%;
    margin: 24px auto;
  `};
`

export const CloseMenu = styled.button`
  display: grid;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.header.menuFlyout.closeButtonBg};
  border: 0;
  color: ${({ theme }) => theme.black};
  height: 36px;
  position: sticky;
  top: 0;
  cursor: pointer;
  border-radius: 6px;
  justify-content: center;
  padding: 0;
  margin: 0 0 8px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    height: 48px;
    border-radius: 0;
    justify-content: flex-end;
  `};

  &::after {
    content: '✕';
    display: block;
    font-size: 20px;
    margin: 0;

    ${({ theme }) => theme.mediaWidth.upToSmall`
      margin: 0 14px 0 0;
      font-size: 24px;
    `};
  }
`

export function Menu() {
  const close = useCloseModals()

  return (
    <StyledMenu>
      <MenuFlyout>
        <CloseMenu onClick={close} />
        <InternalMenuItem to="/faq" onClick={close}>
          <Code size={14} />
          FAQ
        </InternalMenuItem>

        {/* <MenuItem id="link" href={DUNE_DASHBOARD_LINK}>
          <PieChart size={14} />
          Stats
        </MenuItem> */}

        <MenuItem id="link" href={CONTRACTS_CODE_LINK}>
          <span aria-hidden="true" onClick={close} onKeyDown={close}>
            <Code size={14} />
            Code
          </span>
        </MenuItem>
        <MenuItem id="link" href={DISCORD_LINK}>
          <span aria-hidden="true" onClick={close} onKeyDown={close}>
            <MessageCircle size={14} />
            Discord
          </span>
        </MenuItem>

        <InternalMenuItem to="/play" onClick={close}>
          <span role="img" aria-label="Play CowGame">
            <img src={GameIcon} alt="Play CowGame" />
          </span>{' '}
          CowGame
        </InternalMenuItem>

        <Separator />

        <Policy to="/terms-and-conditions" onClick={close} onKeyDown={close}>
          Terms and conditions
        </Policy>
        {/* 
        <Policy to="/privacy-policy">Privacy policy</Policy>
        <Policy to="/cookie-policy">Cookie policy</Policy> 
        */}
      </MenuFlyout>
    </StyledMenu>
  )
}

export default Menu
