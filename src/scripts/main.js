import { $, html, body, waitForDomElement, raf, ctxOptions } from './libs/generic'
import AmbilightSentry from './libs/ambilight-sentry'
import Ambilight from './classes/ambilight'

const ambilightSetVideoInfo = () => {
  window.currentVideoInfo = {
    mimeType: {
      available: [],
      current: {
        video: undefined,
        audio: undefined
      }
    }
  }
}
const ambilightDetectVideoInfo = () => {
  try {
    const saveStreamingData = () => {
      try {
        if(!ytplayer.config || !ytplayer.config.args || !ytplayer.config.args.player_response) return

        const videoInfo = window.currentVideoInfo
        const streamingData = (JSON.parse(ytplayer.config.args.player_response).streamingData)
        if(streamingData.formats)
          streamingData.formats.forEach(format => {
            if(!videoInfo.mimeType.available.find(mimeType => mimeType === format.mimeType))
            videoInfo.mimeType.available.push(format.mimeType)
          })
        if(streamingData.adaptiveFormats)
          streamingData.adaptiveFormats.forEach(format => {
            if(!videoInfo.mimeType.available.find(mimeType => mimeType === format.mimeType))
            videoInfo.mimeType.available.push(format.mimeType)
          })
      } catch(ex) { 
        console.warn('YouTube Ambilight | ambilightDetectVideoInfo | saveStreamingData:', ex.message)
      }
    };

    var origOpen = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function() {
      this.addEventListener('load', function() {
        try {
          const querystring = new URLSearchParams(this.responseURL.substr(this.responseURL.indexOf('?') + 1))
          const mime = querystring.get('mime')
          if(!mime) return

          const videoInfo = window.currentVideoInfo

          if(mime.indexOf('video') === 0) {
            if(videoInfo.mimeType.current.video !== mime)
            videoInfo.mimeType.current.video = mime
          } else if(mime.indexOf('audio') === 0) {
            if(videoInfo.mimeType.current.audio !== mime)
            videoInfo.mimeType.current.audio = mime
          }
          saveStreamingData()
        } catch (ex) {
          console.warn('YouTube Ambilight | ambilightDetectVideoInfo | load:', ex.message)
          //AmbilightSentry.captureExceptionWithDetails(ex)
        }
      })
      origOpen.apply(this, arguments)
    }

    saveStreamingData()
  } catch (ex) {
    console.warn('YouTube Ambilight | ambilightDetectVideoInfo:', ex.message)
    //AmbilightSentry.captureExceptionWithDetails(ex)
  }
}
ambilightSetVideoInfo()
ambilightDetectVideoInfo()


const resetThemeToLightIfSettingIsTrue = () => {
  const key = 'resetThemeToLightOnDisable'
  try {
    const value = (localStorage.getItem(`ambilight-${key}`) === 'true')
    if (!value) return
  } catch (ex) {
    console.warn('YouTube Ambilight | resetThemeToLightIfSettingIsTrue', ex)
    //AmbilightSentry.captureExceptionWithDetails(ex)
    return
  }

  Ambilight.setDarkTheme(false)
}


const ambilightDetectDetachedVideo = () => {
  const containerElem = $.s('.html5-video-container')
  const ytpAppElem = $.s('ytd-app')

  const observer = new MutationObserver((mutationsList, observer) => {
    if (!ytpAppElem.hasAttribute('is-watch-page')) return

    const videoElem = containerElem.querySelector('video')
    if (!videoElem) return

    const isDetached = ambilight.videoElem !== videoElem
    if (!isDetached) return

    ambilight.initVideoElem(videoElem)
  })

  observer.observe(containerElem, {
    attributes: true,
    attributeOldValue: false,
    characterData: false,
    characterDataOldValue: false,
    childList: false,
    subtree: true
  })
}

const tryInitClassicAmbilight = () => {
  const classicBodyElem = $.s('body[data-spf-name="watch"]')
  const classicVideoElem = $.s("video.html5-main-video")
  if(!classicBodyElem || !classicVideoElem) return false

  Ambilight.isClassic = true
  window.ambilight = new Ambilight(classicVideoElem)
  return true
}
const tryInitAmbilight = () => {
  if (!$.s('ytd-app[is-watch-page]')) return

  const videoElem = $.s("ytd-watch-flexy video")
  if (!videoElem) return false

  const settingsBtnContainerElem = $.s('.ytp-right-controls, .ytp-chrome-controls > *:last-child')
  if(!settingsBtnContainerElem) {
    if(!window.ambilightSettingsBtnContainerElemUndefinedThrown) {
      window.ambilightSettingsBtnContainerElemUndefinedThrown = true
      const ex = new Error('Tried to initialize ambilight without settingsBtnContainerElem')
      console.warn(ex)
      AmbilightSentry.captureExceptionWithDetails(ex)
    }
    return false
  }

  const playerElem = $.s('.html5-video-player')
  if(!playerElem) {
    if(!window.ambilightPlayerElemUndefinedThrown) {
      window.ambilightPlayerElemUndefinedThrown = true
      const ex = new Error('Tried to initialize ambilight without playerElem')
      console.warn(ex)
      AmbilightSentry.captureExceptionWithDetails(ex)
    }
    return false
  }


  window.ambilight = new Ambilight(videoElem)
  ambilightDetectDetachedVideo()
  return true
}

const ambilightDetectPageTransition = () => {
  const observer = new MutationObserver((mutationsList, observer) => {
    if (!window.ambilight) return

    const isOnVideoPage = !!($.s('body[data-spf-name="watch"]') || $.s('ytd-app[is-watch-page]'))
    window.ambilight.isOnVideoPage = isOnVideoPage
    if (isOnVideoPage) {
      window.ambilight.start()
    } else {
      window.ambilight.hide()
      if (ambilight.resetThemeToLightOnDisable) {
        Ambilight.setDarkTheme(false)
      }
    }
  })
  var appElem = $.s('ytd-app, body[data-spf-name]')
  if(!appElem) return
  observer.observe(appElem, {
    attributes: true,
    attributeFilter: ['is-watch-page', 'data-spf-name']
  })
}

const ambilightDetectVideoPage = () => {
  if (tryInitAmbilight()) return
  if (tryInitClassicAmbilight()) return

  if ($.s('ytd-app:not([is-watch-page])')) {
    resetThemeToLightIfSettingIsTrue()
  }

  const observer = new MutationObserver((mutationsList, observer) => {
    if (window.ambilight) {
      observer.disconnect()
      return
    }

    tryInitAmbilight()
    tryInitClassicAmbilight()
  })
  var appElem = $.s('ytd-app, body[data-spf-name]')
  if(!appElem) return
  observer.observe(appElem, {
    childList: true,
    subtree: true
  })
}

try {
  if(!window.ambilight) {
    ambilightDetectPageTransition()
    ambilightDetectVideoPage()
  }
} catch (ex) {
  console.error('YouTube Ambilight | Initialization', ex)
  AmbilightSentry.captureExceptionWithDetails(ex)
}