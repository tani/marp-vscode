import browserCjs from '@marp-team/marp-core/lib/browser.cjs'
import { webkit } from '@marp-team/marpit-svg-polyfill'

const slideElmQuery = 'svg[data-marpit-svg]'

export default function preview() {
  const marpVscode = document.getElementById('marp-vscode')

  if (marpVscode) {
    document.body.classList.add('marp-vscode')

    // 1:1 slide mode
    marpVscode.classList.add('one-by-one')

    // Remove default styles
    const styles = document.querySelectorAll(
      'style:not(#marp-vscode-style):not(#_defaultStyles)'
    )
    const links = document.querySelectorAll(
      'link[rel="stylesheet"]:not([href*="marp-vscode"])'
    )
    styles.forEach(elm => elm.remove())
    links.forEach(elm => elm.remove())

    // Run Marp observer
    browserCjs()

    // WebKit polyfill (for Electron 3)
    if (marpVscode.dataset.polyfill) {
      const observer = () => {
        webkit(Number.parseFloat(marpVscode.dataset.zoom || '1') || 1)
        window.requestAnimationFrame(observer)
      }
      observer()
    }

    // Observe active line
    const updateActiveSlide = (element?: Element) => {
      const elm = element || marpVscode.querySelector(slideElmQuery)!

      marpVscode
        .querySelectorAll(slideElmQuery)
        .forEach(e => e.classList.remove('marp-vscode-active'))

      elm.classList.add('marp-vscode-active')
    }
    updateActiveSlide()

    const active = 'code-active-line'
    const activeLineObserver = new MutationObserver(mutations => {
      mutations.forEach(m => {
        const elm = m.target as HTMLElement
        const wasActive = (m.oldValue || '').includes(active)
        const isActive = elm.classList.contains(active)

        if (!wasActive && isActive) {
          updateActiveSlide(elm.closest(slideElmQuery) || undefined)
        }
      })
    })

    activeLineObserver.observe(document.body, {
      attributeFilter: ['class'],
      attributeOldValue: true,
      childList: true,
      subtree: true,
    })
  }
}
