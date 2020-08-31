import Settings from "./settings"

export default class Ambilight {
  static isClassic = false
  VIEW_DETACHED = 'VIEW_DETACHED'
  VIEW_SMALL = 'VIEW_SMALL'
  VIEW_THEATER = 'VIEW_THEATER'
  VIEW_FULLSCREEN = 'VIEW_FULLSCREEN'
  VIEW_POPUP = 'VIEW_POPUP'

  showDisplayFrameRate = true
  showVideoFrameRate = true

  horizontalBarsClipPX = 0

  projectorOffset = {}
  srcVideoOffset = {}

  isHidden = true
  isOnVideoPage = true
  showedCompareWarning = false

  p = null
  a = null
  view = -1
  isFullscreen = false
  isFillingFullscreen = false
  isVR = false

  videoFrameCount = 0
  skippedFramesCount = 0
  displayFrameRate = 0
  videoFrameRate = 0
  videoFrameRateMeasureStartTime = 0
  videoFrameRateMeasureStartFrame = 0
  ambilightFrameCount = 0
  ambilightFrameRate = 0
  previousFrameTime = 0
  syncInfo = []

  enableMozillaBug1606251Workaround = false

  constructor(videoElem) {
    this.initVideoElem(videoElem)

    this.detectMozillaBug1606251Workaround()

    this.initFeedbackLink()
    this.settings = new Settings()

    this.initAmbilightElems()
    this.initBuffers()
    this.recreateProjectors()
    this.initFPSListElem()

    this.initStyles()
    this.updateStyles()

    this.initScrollPosition()
    this.initImmersiveMode()

    this.initListeners()
    this.initGetImageDataAllowed()

    setTimeout(() => {
      if (this.enabled)
        this.enable(true)
    }, 0)
  }

  initVideoElem(videoElem) {
    this.videoElem = videoElem
  }

  // FireFox workaround: Force to rerender the outer blur of the canvasses
  // https://bugzilla.mozilla.org/show_bug.cgi?id=1606251
  detectMozillaBug1606251Workaround() {
    if(this.videoElem.mozPaintedFrames) {
      const firefoxUserAgentMatches = navigator.userAgent.match('Firefox/((\.|[0-9])+)')
      if(firefoxUserAgentMatches && firefoxUserAgentMatches.length >= 2) {
        const firefoxVersion = parseFloat(firefoxUserAgentMatches[1])
        if(firefoxVersion && firefoxVersion < 74) {
          this.enableMozillaBug1606251Workaround = resetThemeToLightIfSettingIsTrue
        }
      }
    }
  }

  initStyles () {
    this.styleElem = document.createElement('style')
    this.styleElem.appendChild(document.createTextNode(''))
    document.head.appendChild(this.styleElem)
  }

  initListeners() {
    this.videoElem
      .on('playing', () => {
        this.initGetImageDataAllowed()
        this.start()
        this.resetSettingsIfNeeded()
      })
      .on('canplay', () => {
        if(!this.videoElem.paused) return;
        this.scheduleNextFrame()
        raf(() => setTimeout(() => this.scheduleNextFrame(), 100)) //Sometimes the first frame was not rendered yet
      })
      .on('seeked', () => {
        this.resetVideoFrameCounter()
        this.scheduleNextFrame()
      })
      .on('ended', () => {
        this.resetSettingsIfNeeded()
        this.clear()
      })
      .on('emptied', () => {
        this.resetSettingsIfNeeded()
        this.clear()
      })

    $.sa('.ytp-size-button, .ytp-miniplayer-button').forEach(btn =>
      btn.on('click', () => {
        raf(() => {
          setTimeout(() => this.checkVideoSize(), 1)
          setTimeout(() => this.checkVideoSize(), 500) //Classic layout
        })
      })
    )

    window.on('resize', () => {
      if (!this.isOnVideoPage) return
      this.checkVideoSize()
      setTimeout(() =>
        raf(() =>
          setTimeout(() => this.checkVideoSize(), 200)
        ),
        200)
    })

    document.on('keydown', (e) => {
      if (!this.isOnVideoPage) return
      if (document.activeElement) {
        const el = document.activeElement
        const tag = el.tagName
        const inputs = ['INPUT', 'SELECT', 'TEXTAREA']
        if (
          inputs.indexOf(tag) !== -1 || 
          (
            el.getAttribute('contenteditable') !== null && 
            el.getAttribute('contenteditable') !== 'false'
          )
        ) {
          return
        }
      }
      if (e.keyCode === 70 || e.keyCode === 84) // f || t
        setTimeout(() => this.checkVideoSize(), 0)
      else if (e.keyCode === 90) // z
        this.toggleImmersiveMode()
      else if (e.keyCode === 65) // a
        this.toggleEnabled()
      else if (e.keyCode === 66) // b
        $.s(`#setting-detectHorizontalBarSizeEnabled`).click()
      else if (e.keyCode === 87) // w
        $.s(`#setting-detectVideoFillScaleEnabled`).click()
    })
  }

  initGetImageDataAllowed() {
    this.getImageDataAllowed = (!window.chrome || (this.videoElem.src && this.videoElem.src.indexOf('youtube.com') !== -1))

    const settings = [
      $.s(`#setting-detectHorizontalBarSizeEnabled`),
      $.s(`#setting-detectColoredHorizontalBarSizeEnabled`),
      $.s(`#setting-detectHorizontalBarSizeOffsetPercentage`)
    ].filter(setting => setting)
    if(this.getImageDataAllowed) {
      settings.forEach(setting => setting.style.display = '')
    } else {
      settings.forEach(setting => setting.style.display = 'none')
    }
  }

  initAmbilightElems() {
    this.elem = document.createElement("div")
    this.elem.class('ambilight')
    body.prepend(this.elem)

    this.videoShadowElem = document.createElement("div")
    this.videoShadowElem.class('ambilight__video-shadow')
    this.elem.prepend(this.videoShadowElem)

    this.filterElem = document.createElement("div")
    this.filterElem.class('ambilight__filter')
    this.elem.prepend(this.filterElem)

    this.clipElem = document.createElement("div")
    this.clipElem.class('ambilight__clip')
    this.filterElem.prepend(this.clipElem)

    this.projectorsElem = document.createElement("div")
    this.projectorsElem.class('ambilight__projectors')
    this.clipElem.prepend(this.projectorsElem)

    this.projectorListElem = document.createElement("div")
    this.projectorListElem.class('ambilight__projector-list')
    this.projectorsElem.prepend(this.projectorListElem)

    const shadowElem = document.createElement('canvas')
    shadowElem.class('ambilight__shadow')
    shadowElem.width = 1920
    shadowElem.height = 1080
    this.projectorsElem.appendChild(shadowElem)
    const shadowCtx = shadowElem.getContext('2d', { ...ctxOptions, alpha: true })
    this.shadow = {
      elem: shadowElem,
      ctx: shadowCtx
    }

    // Warning: Using Canvas elements in this div instead of OffScreenCanvas
    // while waiting for a fix for this issue:
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1015729
    //this.buffersElem = document.createElement('div')
    //this.buffersElem.class('ambilight__buffers')
    //this.elem.prepend(this.buffersElem)
  }

  initBuffers() {
    const videoSnapshotBufferElem = document.createElement("canvas") //new OffscreenCanvas(1, 1) 
    //this.buffersElem.appendChild(videoSnapshotBufferElem)
    this.videoSnapshotBuffer = {
      elem: videoSnapshotBufferElem,
      ctx: videoSnapshotBufferElem.getContext('2d', ctxOptions)
    }

    const projectorsBufferElem = document.createElement("canvas") //new OffscreenCanvas(1, 1) 
    //this.buffersElem.appendChild(projectorsBufferElem)
    this.projectorBuffer = {
      elem: projectorsBufferElem,
      ctx: projectorsBufferElem.getContext('2d', ctxOptions)
    }
  }

  initFPSListElem() {
    if (!this.showDisplayFrameRate && !this.showVideoFrameRate) return
    if (this.videoSyncedElem && this.videoSyncedElem.isConnected) return

    this.FPSListElem = document.createElement("div")
    this.FPSListElem.class('ambilight__fps-list')

    this.videoSyncedElem = document.createElement("div")
    this.videoSyncedElem.class('ambilight__video-synced')
    this.FPSListElem.prepend(this.videoSyncedElem)

    this.displayFPSElem = document.createElement("div")
    this.displayFPSElem.class('ambilight__display-fps')
    this.FPSListElem.prepend(this.displayFPSElem)

    this.skippedFramesElem = document.createElement("div")
    this.skippedFramesElem.class('ambilight__skipped-frames')
    this.FPSListElem.prepend(this.skippedFramesElem)

    this.ambilightFPSElem = document.createElement("div")
    this.ambilightFPSElem.class('ambilight__ambilight-fps')
    this.FPSListElem.prepend(this.ambilightFPSElem)

    this.videoFPSElem = document.createElement("div")
    this.videoFPSElem.class('ambilight__video-fps')
    this.FPSListElem.prepend(this.videoFPSElem)

    const playerContainerElem = (Ambilight.isClassic) ? $.s('#player-api') : $.s('#player-container')
    playerContainerElem.prepend(this.FPSListElem)
  }

  initVideoOverlay() {
    const videoOverlayElem = document.createElement('canvas')
    videoOverlayElem.class('ambilight__video-overlay')
    this.videoOverlay = {
      elem: videoOverlayElem,
      ctx: videoOverlayElem.getContext('2d', ctxOptions),
      isHiddenChangeTimestamp: 0
    }
  }

  initFrameBlending() {
    //this.previousProjectorBuffer
    const previousProjectorsBufferElem = document.createElement("canvas") //new OffscreenCanvas(1, 1) 
    //this.buffersElem.appendChild(previousProjectorsBufferElem)
    this.previousProjectorBuffer = {
      elem: previousProjectorsBufferElem,
      ctx: previousProjectorsBufferElem.getContext('2d', ctxOptions)
    }

    //this.blendedProjectorBuffer
    const blendedProjectorsBufferElem = document.createElement("canvas") //new OffscreenCanvas(1, 1) 
    //this.buffersElem.appendChild(blendedProjectorsBufferElem)
    this.blendedProjectorBuffer = {
      elem: blendedProjectorsBufferElem,
      ctx: blendedProjectorsBufferElem.getContext('2d', ctxOptions)
    }
  }

  initVideoOverlayWithFrameBlending() {
    //this.videoOverlayBuffer
    const videoOverlayBufferElem = document.createElement("canvas") //new OffscreenCanvas(1, 1) 
    //this.buffersElem.appendChild(videoOverlayBufferElem)
    this.videoOverlayBuffer = {
      elem: videoOverlayBufferElem,
      ctx: videoOverlayBufferElem.getContext('2d', ctxOptions)
    }

    //this.previousVideoOverlayBuffer
    const previousVideoOverlayBufferElem = document.createElement("canvas") //new OffscreenCanvas(1, 1) 
    //this.buffersElem.appendChild(previousVideoOverlayBufferElem)
    this.previousVideoOverlayBuffer = {
      elem: previousVideoOverlayBufferElem,
      ctx: previousVideoOverlayBufferElem.getContext('2d', ctxOptions)
    }
  }

  resetSettingsIfNeeded() {
    const videoPath = location.search
    if (!this.prevVideoPath || videoPath !== this.prevVideoPath) {
      if (this.horizontalBarsClipPercentageReset) {
        this.setHorizontalBars(0)
      }
      if(this.detectVideoFillScaleEnabled) {
        this.setSetting('videoScale', 100)
      }
    }
    this.prevVideoPath = videoPath
  }

  setHorizontalBars(percentage) {
    this.horizontalBarsClipPercentage = percentage
    this.updateSizes(true)
    setTimeout(() => {
      this.setSetting('horizontalBarsClipPercentage', percentage)
      const rangeInput = $.s('#setting-horizontalBarsClipPercentage-range')
      if(rangeInput) {
        rangeInput.value = percentage
        $.s(`#setting-horizontalBarsClipPercentage-value`).textContent = `${percentage}%`
      }
    }, 1)
  }

  initFeedbackLink() {
    const version = html.getAttribute('data-ambilight-version') || ''
    const os = html.getAttribute('data-ambilight-os') || ''
    const browser = html.getAttribute('data-ambilight-browser') || ''
    this.feedbackFormLink = `https://docs.google.com/forms/d/e/1FAIpQLSe5lenJCbDFgJKwYuK_7U_s5wN3D78CEP5LYf2lghWwoE9IyA/viewform?usp=pp_url&entry.1590539866=${version}&entry.1676661118=${os}&entry.964326861=${browser}`
  }

  recreateProjectors() {
    const spreadLevels = Math.max(2, Math.round((this.spread / this.edge)) + this.innerStrength + 1)

    if (!this.projectors) {
      this.projectors = []
    }

    this.projectors = this.projectors.filter((projector, i) => {
      if (i >= spreadLevels) {
        projector.elem.remove()
        return false
      }
      return true
    })

    for (let i = this.projectors.length; i < spreadLevels; i++) {
      const projectorElem = $.create('canvas')
      projectorElem.class('ambilight__projector')

      const projectorCtx = projectorElem.getContext('2d', ctxOptions)
      this.projectorListElem.prepend(projectorElem)

      this.projectors.push({
        elem: projectorElem,
        ctx: projectorCtx
      })
    }
  }

  resetVideoFrameCounter() {
    this.videoFrameCount = 0
  }

  clear() {
    ambilightSetVideoInfo()
    this.projectors.forEach((projector) => {
      projector.ctx.fillStyle = '#000'
      projector.ctx.fillRect(0, 0, projector.elem.width, projector.elem.height)
    })
  }

  detectVideoFillScale() {
    let videoScale = 100
    if(this.videoElem.offsetWidth && this.videoElem.offsetHeight) {
      const videoContainer = this.videoElem.closest('.html5-video-player')
      if(videoContainer) {
        const videoScaleY = (100 - (this.horizontalBarsClipPercentage * 2)) / 100
        const videoWidth = this.videoElem.offsetWidth
        const videoHeight = this.videoElem.offsetHeight * videoScaleY
        const containerWidth = videoContainer.offsetWidth
        const containerHeight = videoContainer.offsetHeight
        const scaleX = containerWidth / videoWidth
        const scaleY = containerHeight / videoHeight

        videoScale = Math.round(Math.min(scaleX, scaleY) * 10000) / 100
        if(isNaN(videoScale)) {
          videoScale = 100
        }
        if(videoScale < 100.5) {
          videoScale = 100
        }
      }
    }

    this.setSetting('videoScale', videoScale)
    if($.s('#setting-videoScale')) {
      $.s('#setting-videoScale-range').value = videoScale
      $.s(`#setting-videoScale-value`).textContent = `${videoScale}%`
    }
  }

  updateSizes(isBlackBarsAdjustment = false) {
    try {
      if(this.detectVideoFillScaleEnabled){
        this.detectVideoFillScale()
      }

      const playerElem = $.s('.html5-video-player')
      const flexyElem = $.s('ytd-watch-flexy')
      const pageElem = $.s('#page')
      this.isVR = !!$.s('.ytp-webgl-spherical')

      if(playerElem) {
        const prevView = this.view
        if(playerElem.classList.contains('ytp-fullscreen'))
          this.view = this.VIEW_FULLSCREEN
        else if(
          (flexyElem && flexyElem.attr('theater') !== null) ||
          (pageElem && pageElem.classList.contains('watch-stage-mode'))
        )
          this.view = this.VIEW_THEATER
        else if(playerElem.classList.contains('ytp-player-minimized'))
          this.view = this.VIEW_POPUP
        else
          this.view = this.VIEW_SMALL
      } else {
        this.view = this.VIEW_DETACHED
      }

      // Todo: Set the settings for the specific view
      // if(prevView !== this.view) {
      //   console.log('VIEW CHANGED: ', this.view)
      //   this.getAllSettings()
      // }

      this.isFullscreen = (this.view == this.VIEW_FULLSCREEN)
      const noClipOrScale = (this.horizontalBarsClipPercentage == 0 && this.videoScale == 100)
      this.isFillingFullscreen = (
        this.isFullscreen &&
        Math.abs(this.projectorOffset.width - window.innerWidth) < 10 &&
        Math.abs(this.projectorOffset.height - window.innerHeight) < 10 &&
        noClipOrScale
      )

      const videoElemParentElem = this.videoElem.parentNode

      const notVisible = (
        !this.enabled ||
        this.isVR ||
        !videoElemParentElem ||
        !playerElem ||
        playerElem.classList.contains('ytp-player-minimized') ||
        (this.isFullscreen && !this.enableInFullscreen)
      )
      if (notVisible || noClipOrScale) {
        if (videoElemParentElem) {
          videoElemParentElem.style.transform = ''
          videoElemParentElem.style.overflow = ''
          videoElemParentElem.style.height = ''
          videoElemParentElem.style.marginBottom = ''
          videoElemParentElem.style.setProperty('--video-transform', '')
        }
      }
      if (notVisible) {
        this.hide()
        return true
      }
      
      if(this.isFullscreen) {
        if(this.elem.parentElement !== playerElem) {
          playerElem.prepend(this.elem)
        }
      } else {
        if(this.elem.parentElement !== body) {
          body.prepend(this.elem)
        }
      }

      const horizontalBarsClip = this.horizontalBarsClipPercentage / 100
      if (!noClipOrScale) {
        const top = Math.max(0, parseInt(this.videoElem.style.top))
        videoElemParentElem.style.height = `${this.videoElem.offsetHeight}px`
        videoElemParentElem.style.marginBottom = `${-this.videoElem.offsetHeight}px`
        videoElemParentElem.style.overflow = 'hidden'

        this.horizontalBarsClipScaleY = (1 - (horizontalBarsClip * 2))
        videoElemParentElem.style.transform =  `
          translateY(${top}px) 
          scale(${(this.videoScale / 100)}) 
          scaleY(${this.horizontalBarsClipScaleY})
        `
        videoElemParentElem.style.setProperty('--video-transform', `
          translateY(${-top}px) 
          scaleY(${(Math.round(1000 * (1 / this.horizontalBarsClipScaleY)) / 1000)})
        `)
      }

      this.projectorOffset = this.videoElem.offset()
      if (
        this.projectorOffset.top === undefined ||
        !this.projectorOffset.width ||
        !this.projectorOffset.height ||
        !this.videoElem.videoWidth ||
        !this.videoElem.videoHeight
      ) return false //Not ready

      const scrollTop = (this.isFullscreen ? (Ambilight.isClassic ? 0 : $.s('ytd-app').scrollTop) : window.scrollY)
      this.projectorOffset = {
        left: this.projectorOffset.left,
        top: this.projectorOffset.top + scrollTop,
        width: this.projectorOffset.width,
        height: this.projectorOffset.height
      }

      this.srcVideoOffset = {
        top: this.projectorOffset.top,
        width: this.videoElem.videoWidth,
        height: this.videoElem.videoHeight
      }

      const minSize = 512
      const scaleX = this.srcVideoOffset.width / minSize
      const scaleY = this.srcVideoOffset.height / minSize
      const scale = Math.min(scaleX, scaleY)
      // A size of > 256 is required to enable keep GPU acceleration enabled in Chrome
      // A side with a size of <= 512 is required to enable GPU acceleration in Chrome
      if (scale < 1) {
        this.p = {
          w: minSize,
          h: minSize
        }
      } else {
        this.p = {
          w: Math.round(this.srcVideoOffset.width / scale),
          h: Math.round((this.srcVideoOffset.height) / scale) // * (1 - (horizontalBarsClip * 2))
        }
      }

      const unscaledWidth = Math.round(this.projectorOffset.width / (this.videoScale / 100))
      const unscaledHeight = Math.round(this.projectorOffset.height / (this.videoScale / 100))
      const unscaledLeft = Math.round(
        (this.projectorOffset.left + window.scrollX) - 
        ((unscaledWidth - this.projectorOffset.width) / 2)
      )
      const unscaledTop = Math.round(
        this.projectorOffset.top - 
        ((unscaledHeight - this.projectorOffset.height) / 2)
      )

      this.horizontalBarsClipScaleY = (1 - (horizontalBarsClip * 2))
      this.projectorsElem.style.left = `${unscaledLeft}px`
      this.projectorsElem.style.top = `${unscaledTop - 1}px`
      this.projectorsElem.style.width = `${unscaledWidth}px`
      this.projectorsElem.style.height = `${unscaledHeight}px`
      this.projectorsElem.style.transform = `
        scale(${(this.videoScale / 100)}) 
        scaleY(${this.horizontalBarsClipScaleY})
      `
      
      if(this.videoShadowOpacity != 0 && this.videoShadowSize != 0) {
        this.videoShadowElem.style.display = 'block'
        this.videoShadowElem.style.left = `${unscaledLeft}px`
        this.videoShadowElem.style.top = `${unscaledTop}px`
        this.videoShadowElem.style.width = `${unscaledWidth}px`
        this.videoShadowElem.style.height = `${(unscaledHeight * this.horizontalBarsClipScaleY)}px`
        this.videoShadowElem.style.transform = `
          translate3d(0,0,0) 
          translateY(${(unscaledHeight * horizontalBarsClip)}px) 
          scale(${(this.videoScale / 100)})
        `
      } else {
        this.videoShadowElem.style.display = ''
      }

      this.filterElem.style.filter = `
        ${(this.blur != 0) ? `blur(${this.projectorOffset.height * (this.blur * .0025)}px)` : ''}
        ${(this.contrast != 100) ? `contrast(${this.contrast}%)` : ''}
        ${(this.brightness != 100) ? `brightness(${this.brightness}%)` : ''}
        ${(this.saturation != 100) ? `saturate(${this.saturation}%)` : ''}
      `

      this.projectors.forEach((projector) => {
        if (projector.elem.width !== this.p.w)
          projector.elem.width = this.p.w
        if (projector.elem.height !== this.p.h)
          projector.elem.height = this.p.h
      })

      this.projectorBuffer.elem.width = this.p.w
      this.projectorBuffer.elem.height = this.p.h

      if (this.frameBlending && !this.previousProjectorBuffer) {
        this.initFrameBlending()
      }
      if (this.videoOverlayEnabled && !this.videoOverlay) {
        this.initVideoOverlay()
      }
      if (this.videoOverlayEnabled && this.frameBlending && !this.previousVideoOverlayBuffer) {
        this.initVideoOverlayWithFrameBlending()
      }
      if(this.videoOverlayEnabled && this.videoOverlay)
        this.checkIfNeedToHideVideoOverlay()

      if (this.frameBlending) {
        this.previousProjectorBuffer.elem.width = this.p.w
        this.previousProjectorBuffer.elem.height = this.p.h
        
        this.blendedProjectorBuffer.elem.width = this.p.w
        this.blendedProjectorBuffer.elem.height = this.p.h
      }

      if (this.videoOverlayEnabled && this.videoOverlay && !this.videoOverlay.elem.parentNode) {
        this.videoOverlay.elem.appendTo($.s('.html5-video-container'))
      } else if (!this.videoOverlayEnabled && this.videoOverlay && this.videoOverlay.elem.parentNode) {
        this.videoOverlay.elem.parentNode.removeChild(this.videoOverlay.elem)
      }
      if (this.videoOverlayEnabled && this.videoOverlay) {
        this.videoOverlay.elem.setAttribute('style', this.videoElem.getAttribute('style'))
        this.videoOverlay.elem.width = this.srcVideoOffset.width
        this.videoOverlay.elem.height = this.srcVideoOffset.height

        if (this.frameBlending) {
          this.videoOverlayBuffer.elem.width = this.srcVideoOffset.width
          this.videoOverlayBuffer.elem.height = this.srcVideoOffset.height

          this.previousVideoOverlayBuffer.elem.width = this.srcVideoOffset.width
          this.previousVideoOverlayBuffer.elem.height = this.srcVideoOffset.height
        }
      }

      if(!isBlackBarsAdjustment) { //Prevent losing imagedata
        this.videoSnapshotBuffer.elem.width = this.p.w
        this.videoSnapshotBuffer.elem.height = this.p.h
      }
      this.videoSnapshotBufferBarsClipPx = Math.round(this.videoSnapshotBuffer.elem.height * horizontalBarsClip)


      this.resizeCanvasses()

      this.resetVideoFrameCounter()
      this.initFPSListElem()

      this.sizesInvalidated = false
      this.buffersCleared = true
      return true
    } catch (ex) {
      console.error('YouTube Ambilight | Resize | UpdateSizes:', ex)
      AmbilightSentry.captureExceptionWithDetails(ex)
      throw new Error('catched')
    }
  }

  updateStyles() {
    const shadowSize = this.surroundingContentShadowSize / 5
    const shadowOpacity = this.surroundingContentShadowOpacity / 100
    const baseurl = html.getAttribute('data-ambilight-baseurl') || ''
    const debandingStrength = parseInt(this.debandingStrength)
    const videoShadowSize = parseInt(this.videoShadowSize, 10) / 2 + Math.pow(this.videoShadowSize / 5, 1.77) // Chrome limit: 250px | Firefox limit: 100px
    const videoShadowOpacity = this.videoShadowOpacity / 100
    
    const noiseImageIndex = (debandingStrength > 75) ? 3 : (debandingStrength > 50) ? 2 : 1
    const noiseOpacity =  debandingStrength / ((debandingStrength > 75) ? 100 : (debandingStrength > 50) ? 75 : 50)
    
    
    document.body.style.setProperty('--ambilight-video-shadow-background', 
      (videoShadowOpacity) ? `rgba(0,0,0,${videoShadowOpacity})` : '')
    document.body.style.setProperty('--ambilight-video-shadow-box-shadow', 
      (videoShadowSize && videoShadowOpacity)
        ? `
          rgba(0,0,0,${videoShadowOpacity}) 0 0 ${videoShadowSize}px,
          rgba(0,0,0,${videoShadowOpacity}) 0 0 ${videoShadowSize}px
        `
        : '')

    document.body.style.setProperty('--ambilight-filter-shadow', 
      (shadowSize && shadowOpacity) 
      ? (
        (shadowOpacity > .5) 
        ? `
          drop-shadow(0 0 ${shadowSize}px rgba(0,0,0,${shadowOpacity}))
          drop-shadow(0 0 ${shadowSize}px rgba(0,0,0,${shadowOpacity}))
        `
        : `drop-shadow(0 0 ${shadowSize}px rgba(0,0,0,${shadowOpacity * 2}))`
      )
      : '')
    document.body.style.setProperty('--ambilight-filter-shadow-inverted', 
      (shadowSize && shadowOpacity) 
      ? (
        (shadowOpacity > .5) 
        ? `
          drop-shadow(0 0 ${shadowSize}px rgba(255,255,255,${shadowOpacity})) 
          drop-shadow(0 0 ${shadowSize}px rgba(255,255,255,${shadowOpacity}))
        `
        : `drop-shadow(0 0 ${shadowSize}px rgba(255,255,255,${shadowOpacity * 2}))`
      )
      : '')

    document.body.style.setProperty('--ambilight-after-content', 
      debandingStrength ? `''` : '')
    document.body.style.setProperty('--ambilight-after-background', 
      debandingStrength ? `url('${baseurl}images/noise-${noiseImageIndex}.png')` : '')
    document.body.style.setProperty('--ambilight-after-opacity', 
      debandingStrength ? noiseOpacity : '')

    document.body.style.setProperty('--ambilight-html5-video-player-overflow', 
      (this.videoScale > 100) ?  'visible' : '')
  }

  resizeCanvasses() {
    const projectorSize = {
      w: this.projectorOffset.width,
      h: this.projectorOffset.height * this.horizontalBarsClipScaleY
    }
    const ratio = (projectorSize.w > projectorSize.h) ?
      {
        x: 1,
        y: (projectorSize.w / projectorSize.h)
      } : {
        x: (projectorSize.h / projectorSize.w),
        y: 1
      }
    const lastScale = {
      x: 1,
      y: 1
    }

    //To prevent 0x0 sized canvas elements causing a GPU memory leak
    const minScale = {
      x: 1/projectorSize.w,
      y: 1/projectorSize.h
    }

    const scaleStep = this.edge / 100

    this.projectors.forEach((projector, i) => {
      const pos = i - this.innerStrength
      let scaleX = 1
      let scaleY = 1

      if (pos > 0) {
        scaleX = 1 + ((scaleStep * ratio.x) * pos)
        scaleY = 1 + ((scaleStep * ratio.y) * pos)
      }

      if (pos < 0) {
        scaleX = 1 - ((scaleStep * ratio.x) * -pos)
        scaleY = 1 - ((scaleStep * ratio.y) * -pos)
        if (scaleX < 0) scaleX = 0
        if (scaleY < 0) scaleY = 0
      }
      lastScale.x = scaleX
      lastScale.y = scaleY
      
      projector.elem.style.transform = `scale(${Math.max(minScale.x, scaleX)}, ${Math.max(minScale.y, scaleY)})`
    })

    this.shadow.elem.style.transform = `scale(${lastScale.x + 0.01}, ${lastScale.y + 0.01})`
    this.shadow.ctx.clearRect(0, 0, this.shadow.elem.width, this.shadow.elem.height)

    //Shadow gradient 
    const drawGradient = (size, edge, keyframes, fadeOutFrom, darkest, horizontal) => {
      const points = [
        0,
        ...keyframes.map(e => Math.max(
          0, edge - (edge * e.p) - (edge * fadeOutFrom * (1 - e.p))
        )),
        edge - (edge * fadeOutFrom),
        edge + size + (edge * fadeOutFrom),
        ...keyframes.reverse().map(e => Math.min(
          edge + size + edge, edge + size + (edge * e.p) + (edge * fadeOutFrom * (1 - e.p))
        )),
        edge + size + edge
      ]

      const pointMax = (points[points.length - 1])
      const gradient = this.shadow.ctx.createLinearGradient(
        0,
        0,
        horizontal ? this.shadow.elem.width : 0,
        !horizontal ? this.shadow.elem.height : 0
      )

      let gradientStops = []
      gradientStops.push([Math.min(1, points[0] / pointMax), `rgba(0,0,0,${darkest})`])
      keyframes.forEach((e, i) => {
        gradientStops.push([Math.min(1, points[0 + keyframes.length - i] / pointMax), `rgba(0,0,0,${e.o})`])
      })
      gradientStops.push([Math.min(1, points[1 + keyframes.length] / pointMax), `rgba(0,0,0,0)`])
      gradientStops.push([Math.min(1, points[2 + keyframes.length] / pointMax), `rgba(0,0,0,0)`])
      keyframes.reverse().forEach((e, i) => {
        gradientStops.push([Math.min(1, points[2 + (keyframes.length * 2) - i] / pointMax), `rgba(0,0,0,${e.o})`])
      })
      gradientStops.push([Math.min(1, points[3 + (keyframes.length * 2)] / pointMax), `rgba(0,0,0,${darkest})`])

      gradientStops = gradientStops.map(args => [(Math.round(args[0] * 10000)/ 10000), args[1]])
      gradientStops.forEach(args => gradient.addColorStop(...args))
      this.shadow.ctx.fillStyle = gradient
      this.shadow.ctx.fillRect(0, 0, this.shadow.elem.width, this.shadow.elem.height)
    }

    const edge = {
      w: ((projectorSize.w * lastScale.x) - projectorSize.w) / 2 / lastScale.x,
      h: ((projectorSize.h * lastScale.y) - projectorSize.h) / 2 / lastScale.y
    }
    const video = {
      w: (projectorSize.w / lastScale.x),
      h: (projectorSize.h / lastScale.y)
    }

    const plotKeyframes = (length, powerOf, darkest) => {
      const keyframes = []
      for (let i = 1; i < length; i++) {
        keyframes.push({
          p: (i / length),
          o: Math.pow(i / length, powerOf) * darkest
        })
      }
      return keyframes.map(({p, o}) => ({
        p: (Math.round(p * 10000) / 10000),
        o: (Math.round(o * 10000) / 10000)
      }))
    }
    const darkest = 1
    const easing = (16 / (this.fadeOutEasing * .64))
    const keyframes = plotKeyframes(256, easing, darkest)

    let fadeOutFrom = this.bloom / 100
    const fadeOutMinH = -(video.h / 2 / edge.h)
    const fadeOutMinW = -(video.w / 2 / edge.w)
    fadeOutFrom = Math.max(fadeOutFrom, fadeOutMinH, fadeOutMinW)

    drawGradient(video.h, edge.h, keyframes, fadeOutFrom, darkest, false)
    drawGradient(video.w, edge.w, keyframes, fadeOutFrom, darkest, true)

    // Directions
    const scaleW = this.shadow.elem.width / (video.w + edge.w + edge.w)
    const scaleH = this.shadow.elem.height / (video.h + edge.h + edge.h)
    this.shadow.ctx.fillStyle = '#000000'


    if(!this.directionTopEnabled) {
      this.shadow.ctx.beginPath()

      this.shadow.ctx.moveTo(0, 0)
      this.shadow.ctx.lineTo(scaleW * (edge.w),                     scaleH * (edge.h))
      this.shadow.ctx.lineTo(scaleW * (edge.w + (video.w / 2)),     scaleH * (edge.h + (video.h / 2)))
      this.shadow.ctx.lineTo(scaleW * (edge.w + video.w),           scaleH * (edge.h))
      this.shadow.ctx.lineTo(scaleW * (edge.w + video.w + edge.w),  0)
      
      this.shadow.ctx.fill()
    }

    if(!this.directionRightEnabled) {
      this.shadow.ctx.beginPath()

      this.shadow.ctx.lineTo(scaleW * (edge.w + video.w + edge.w),  0)
      this.shadow.ctx.lineTo(scaleW * (edge.w + video.w),           scaleH * (edge.h))
      this.shadow.ctx.lineTo(scaleW * (edge.w + (video.w / 2)),     scaleH * (edge.h + (video.h / 2)))
      this.shadow.ctx.lineTo(scaleW * (edge.w + video.w),           scaleH * (edge.h + video.h))
      this.shadow.ctx.lineTo(scaleW * (edge.w + video.w + edge.w),  scaleH * (edge.h + video.h + edge.h))
      
      this.shadow.ctx.fill()
    }

    if(!this.directionBottomEnabled) {
      this.shadow.ctx.beginPath()

      this.shadow.ctx.moveTo(0,                                     scaleH * (edge.h + video.h + edge.h))
      this.shadow.ctx.lineTo(scaleW * (edge.w),                     scaleH * (edge.h + video.h))
      this.shadow.ctx.lineTo(scaleW * (edge.w + (video.w / 2)),     scaleH * (edge.h + (video.h / 2)))
      this.shadow.ctx.lineTo(scaleW * (edge.w + video.w),           scaleH * (edge.h + video.h))
      this.shadow.ctx.lineTo(scaleW * (edge.w + video.w + edge.w),  scaleH * (edge.h + video.h + edge.h))
      
      this.shadow.ctx.fill()
    }

    if(!this.directionLeftEnabled) {
      this.shadow.ctx.beginPath()

      this.shadow.ctx.moveTo(0,                                     0)
      this.shadow.ctx.lineTo(scaleW * (edge.w),                     scaleH * (edge.h))
      this.shadow.ctx.lineTo(scaleW * (edge.w + (video.w / 2)),     scaleH * (edge.h + (video.h / 2)))
      this.shadow.ctx.lineTo(scaleW * (edge.w),                     scaleH * (edge.h + video.h))
      this.shadow.ctx.lineTo(0,                                     scaleH * (edge.h + video.h + edge.h))
      
      this.shadow.ctx.fill()
    }
  }

  checkVideoSize() {
    if (this.canvassesInvalidated) {
      this.canvassesInvalidated = false
      this.recreateProjectors()
    }

    if (this.sizesInvalidated) {
      this.sizesInvalidated = false
      return this.updateSizes()
    }

    //Resized
    if (this.previousEnabled !== this.enabled) {
      this.previousEnabled = this.enabled
      return this.updateSizes()
    }

    //Auto quality moved up or down
    if (this.srcVideoOffset.width !== this.videoElem.videoWidth
      || this.srcVideoOffset.height !== this.videoElem.videoHeight) {
      return this.updateSizes()
    }

    if (this.videoOverlayEnabled && this.videoOverlay && this.videoElem.getAttribute('style') !== this.videoOverlay.elem.getAttribute('style')) {
      return this.updateSizes()
    }

    const projectorsElemRect = this.projectorsElem.getBoundingClientRect()
    const videoElemRec = this.videoElem.getBoundingClientRect()
    const expectedProjectsElemRectY = videoElemRec.y + (videoElemRec.height * (this.horizontalBarsClipPercentage/100))
    if (
      Math.abs(projectorsElemRect.width - videoElemRec.width) > 1 ||
      Math.abs(projectorsElemRect.x - videoElemRec.x) > 1 ||
      Math.abs(projectorsElemRect.y - expectedProjectsElemRectY) > 2
    ) {
      return this.updateSizes()
    }

    
    const noClipOrScale = (this.horizontalBarsClipPercentage == 0 && this.videoScale == 100)
    if(!noClipOrScale) {
      const videoElemParentElem = this.videoElem.parentElement
      if(videoElemParentElem) {
        const videoTransform = videoElemParentElem.style.getPropertyValue('--video-transform')
        const top = Math.max(0, parseInt(this.videoElem.style.top))
        const scaleY = (Math.round(1000 * (1 / this.horizontalBarsClipScaleY)) / 1000)
        if(
          videoTransform.indexOf(`translateY(${-top}px)`) === -1 ||
          videoTransform.indexOf(`scaleY(${scaleY})`) === -1
        ) {
          return this.updateSizes()
        }
      }
    }

    //What use case is this?
    // if(this.videoShadowOpacity != 0 && this.videoShadowSize != 0) {
    //   const horizontalBarsClip = this.horizontalBarsClipPercentage / 100
    //   const unscaledHeight = Math.round(this.projectorOffset.height / (this.videoScale / 100))
    //   if(this.videoShadowElem.style.transform !== `translate3d(0px, 0px, 0px) translateY(${(unscaledHeight * horizontalBarsClip)}px) scale(${(this.videoScale / 100)})`) {
    //     console.log('nope!', 
    //       this.videoShadowElem.style.transform, 
    //       `translate3d(0px, 0px, 0px) translateY(${(unscaledHeight * horizontalBarsClip)}px) scale(${(this.videoScale / 100)})`)
    //     return this.updateSizes()
    //   } else {
    //     console.log('yes!', 
    //       this.videoShadowElem.style.transform, 
    //       `translate3d(0px, 0px, 0px) translateY(${(unscaledHeight * horizontalBarsClip)}px) scale(${(this.videoScale / 100)})`)
    //   }
    // }


    return true
  }

  scheduleNextFrame() {
    try {
      if (!this.enabled || !this.isOnVideoPage) return

      if(this.rafId) return

      if(this.videoRafId && this.videoElem.paused) {
        this.videoElem.cancelAnimationFrame(this.videoRafId)
        this.videoRafId = undefined
        this.scheduled = false
      }

      if(this.scheduled) return
      this.scheduled = true

      if(this.videoHasRequestAnimationFrame && !this.videoElem.paused && !this.frameBlending) {
        this.videoRafId = this.videoElem.requestAnimationFrame(this.onNextFrame)
        return
      }

      this.rafId = raf(this.onNextFrame)
    } catch (ex) {
      if(ex.message === 'catched') return
      console.error('YouTube Ambilight | ScheduleNextFrame:', ex)
      AmbilightSentry.captureExceptionWithDetails(ex)
    }
  }

  onNextFrame = () => {
    try {
      this.rafId = undefined
      this.videoRafId = undefined
      if(!this.framerateLimit) {
        this.nextFrame()
        return
      }

      const nextFrameTime = performance.now()
      const delayTime = (this.lastNextFrameTime && !this.videoElem.paused) 
        ? Math.max(0, (1000 / this.framerateLimit) - Math.max(0, (nextFrameTime - this.lastNextFrameTime))) 
        : 0
      if(!delayTime) {
        this.lastNextFrameTime = performance.now()
        this.nextFrame()
        return
      }

      setTimeout(() => {
        this.lastNextFrameTime = performance.now()
        this.nextFrame()
      }, delayTime)
    } catch (ex) {
      if(ex.message === 'catched') return
      console.error('YouTube Ambilight | OnNextFrame:', ex)
      AmbilightSentry.captureExceptionWithDetails(ex)
    }
  }

  nextFrame = (time, { presentedFrames } = {}) => {
    try {
      this.requestAnimationFramePresentedFrames = presentedFrames

      if (!this.scheduled) return
      this.scheduled = false

      if (!this.checkVideoSize()) {
        this.videoFrameCount = 0
        return
      } else if (!this.p) {
        //If was detected hidden by checkVideoSize => updateSizes this.p won't be initialized yet
        return
      }
      
      try {
        this.drawAmbilight()
      } catch (ex) {
        if(ex.name == 'NS_ERROR_NOT_AVAILABLE') {
          if(!this.catchedNS_ERROR_NOT_AVAILABLE) {
            this.catchedNS_ERROR_NOT_AVAILABLE = true
            console.error('YouTube Ambilight | NextFrame:', ex)
            AmbilightSentry.captureExceptionWithDetails(ex)
          }
        } else if(ex.name == 'NS_ERROR_OUT_OF_MEMORY') {
          if(!this.catchedNS_ERROR_OUT_OF_MEMORY) {
            this.catchedNS_ERROR_OUT_OF_MEMORY = true
            console.error('YouTube Ambilight | NextFrame:', ex)
            AmbilightSentry.captureExceptionWithDetails(ex)
          }
        } else {
          throw ex
        }
      }

      this.detectVideoFrameRate()
      this.detectAmbilightFrameRate()
      this.detectVideoSynced()

      if (this.videoElem.paused) {
        return
      }

      this.scheduleNextFrame()
    } catch (ex) {
      if(ex.message === 'catched') return
      console.error('YouTube Ambilight | NextFrame:', ex)
      AmbilightSentry.captureExceptionWithDetails(ex)
    }
  }

  isNewFrame(oldLines, newLines) {
    if (!oldLines || oldLines.length !== newLines.length) {
      return true
    }

    for (let i = 0; i < oldLines.length; i++) {
      for (let xi = 0; xi < oldLines[i].length; xi+=10) {
        if (oldLines[i][xi] !== newLines[i][xi]) {
          return true
        }
      }
    }

    return false
  }

  hideFPS() {
    this.videoFPSElem.textContent = ''
    this.displayFPSElem.textContent = ''
    this.ambilightFPSElem.textContent = ''
    this.skippedFramesElem.textContent = ''
    this.videoSyncedElem.textContent = ''
  }

  detectVideoSynced() {
    if (!this.showFPS || !this.videoOverlay) return
    if (this.videoSyncedElem.textContent) {
      if (!this.videoOverlayEnabled) {
        this.videoSyncedElem.textContent = ''
        return
      }
      if (this.videoOverlay.isHidden !== undefined && this.videoOverlay.isHidden === this.detectVideoSyncedWasHidden)
        return
    }
    if (!this.videoOverlayEnabled) return

    this.videoSyncedElem.textContent = this.videoOverlayEnabled ? `VIDEO SYNCED: ${this.videoOverlay.isHidden ? 'NO' : 'YES'}` : ''
    this.videoSyncedElem.style.color = this.videoOverlay.isHidden ? '#f33' : '#7f7'
    this.detectVideoSyncedWasHidden = this.videoOverlay.isHidden
  }

  detectVideoFrameRate() {
    if (this.videoFrameRateStartTime === undefined) {
      this.videoFrameRateStartTime = 0
      this.videoFrameRateStartFrame = 0
    }

    const frameCount = this.getVideoFrameCount()
    const videoFrameRateFrame = frameCount
    const videoFrameRateTime = performance.now()
    if (this.videoFrameRateStartTime + 2000 < videoFrameRateTime) {
      if (this.videoFrameRateStartFrame !== 0) {
        this.videoFrameRate = (
          (videoFrameRateFrame - this.videoFrameRateStartFrame) / 
          ((videoFrameRateTime - this.videoFrameRateStartTime) / 1000)
        )
        if (this.showFPS) {
          const frameRateText = (
              Math.round(
                Math.min(this.videoFrameRate, Math.max(0, this.videoFrameRate)) * 100
              ) / 100
            ).toFixed(2)
          this.videoFPSElem.textContent = `VIDEO: ${frameRateText}`
        } else if (this.videoFPSElem.textContent !== '') {
          this.videoFPSElem.textContent = ''
        }
      }
      this.videoFrameRateStartFrame = videoFrameRateFrame
      this.videoFrameRateStartTime = videoFrameRateTime
    }
  }

  detectDisplayFrameRate = () => {
    if(!this.detectDisplayFrameRateScheduled) return
    this.detectDisplayFrameRateScheduled = false

    const displayFrameRateTime = performance.now()
    if (this.displayFrameRateStartTime < displayFrameRateTime - 2000) {
      this.displayFrameRate = this.displayFrameRateFrame / ((displayFrameRateTime - this.displayFrameRateStartTime) / 1000)
      if (this.showFPS) {
        const frameRateText = (Math.round(Math.max(0, this.displayFrameRate) * 100) / 100).toFixed(2)
        this.displayFPSElem.textContent = `DISPLAY: ${frameRateText}`
        this.displayFPSElem.style.color = (this.displayFrameRate < this.videoFrameRate - 1) 
          ? '#f33' 
          : (this.displayFrameRate < this.videoFrameRate - 0.01) ? '#df0' : '#7f7'
      } else if (this.displayFPSElem.textContent !== '') {
        this.displayFPSElem.textContent = ''
      }
      this.displayFrameRateFrame = 1
      this.displayFrameRateStartTime = displayFrameRateTime
    } else {
      if (!this.displayFrameRateFrame) {
        this.displayFrameRateFrame = 1
        this.displayFrameRateStartTime = displayFrameRateTime
      } else {
        this.displayFrameRateFrame++
      }
    }
    
    if(!this.enabled || this.videoElem.paused) return

    this.detectDisplayFrameRateScheduled = true
    raf(this.detectDisplayFrameRate)
  }

  detectAmbilightFrameRate() {
    if (this.showFPS) {
      this.skippedFramesElem.textContent = `DROPPED FRAMES: ${this.skippedFramesCount}`
      this.skippedFramesElem.style.color = (this.skippedFramesCount > 0) ? '#f33' : '#7f7'
    } else {
      this.skippedFramesElem.textContent = ''
    }

    if (this.ambilightFrameRateStartTime === undefined) {
      this.ambilightFrameRateStartTime = 0
      this.ambilightFrameRateStartFrame = 0
    }

    const frameCount = this.ambilightFrameCount
    const ambilightFrameRateFrame = frameCount
    const ambilightFrameRateTime = performance.now()

    if (this.ambilightFrameRateStartTime + 2000 < ambilightFrameRateTime) {
      if (this.ambilightFrameRateStartFrame !== 0) {
        this.ambilightFrameRate = (
          (ambilightFrameRateFrame - this.ambilightFrameRateStartFrame) / 
          ((ambilightFrameRateTime - this.ambilightFrameRateStartTime) / 1000)
        )
        if (this.showFPS) {
          const frameRateText = (
            Math.round(
              Math.min(this.displayFrameRate || this.ambilightFrameRate, Math.max(0, this.ambilightFrameRate)) * 100
            ) / 100
          ).toFixed(2)
          this.ambilightFPSElem.textContent = `AMBILIGHT: ${frameRateText}`
          this.ambilightFPSElem.style.color = (this.ambilightFrameRate < this.videoFrameRate * .9) 
            ? '#f33' 
            : (this.ambilightFrameRate < this.videoFrameRate - 0.01) ? '#df0' : '#7f7'
        } else if (this.ambilightFPSElem.textContent !== '') {
          this.ambilightFPSElem.textContent = ''
        }
      }
      this.ambilightFrameRateStartFrame = ambilightFrameRateFrame
      this.ambilightFrameRateStartTime = ambilightFrameRateTime
    }
  }

  getVideoFrameCount() {
    if (!this.videoElem) return 0
    if (this.requestAnimationFramePresentedFrames) return this.requestAnimationFramePresentedFrames
    return this.videoElem.mozPaintedFrames || // Firefox
      (this.videoElem.webkitDecodedFrameCount + this.videoElem.webkitDroppedFrameCount) // Chrome
  }

  drawAmbilight() {
    if (!this.enabled) return

    if (
      this.isVR ||
      (this.isFillingFullscreen && !this.detectHorizontalBarSizeEnabled && !this.frameBlending) ||
      (!this.enableInFullscreen && this.isFullscreen)
    ) {
      this.hide()
      return
    }

    if (this.isHidden) {
      this.show()
    }

    //performance.mark('start-drawing')

    let newVideoFrameCount = this.getVideoFrameCount()
    this.videoSnapshotBuffer.ctx.drawImage(this.videoElem, 
      0, 0, this.videoSnapshotBuffer.elem.width, this.videoSnapshotBuffer.elem.height)

    let hasNewFrame = false
    if(this.videoHasRequestAnimationFrame && !this.frameBlending) {
      hasNewFrame = true
    } else if(this.frameSync == 0) {
      hasNewFrame = (this.videoFrameCount < newVideoFrameCount)
    } else if (this.frameSync == 50 || this.frameBlending) {
      hasNewFrame = (this.videoFrameCount < newVideoFrameCount)
      if (this.getImageDataAllowed && this.videoFrameRate && this.displayFrameRate && this.displayFrameRate > this.videoFrameRate) {
        if(!hasNewFrame || this.framerateLimit > this.videoFrameRate - 1) {
          //performance.mark('comparing-compare-start')
          let lines = []
          let partSize = Math.ceil(this.videoSnapshotBuffer.elem.height / 3)

          try {
            for (let i = partSize; i < this.videoSnapshotBuffer.elem.height; i += partSize) {
              lines.push(this.videoSnapshotBuffer.ctx.getImageData(0, i, this.videoSnapshotBuffer.elem.width, 1).data)
            }
          } catch (ex) {
            if (!this.showedCompareWarning) {
              this.showedCompareWarning = true
              console.warn('Failed to retrieve video data. ', ex)
              AmbilightSentry.captureExceptionWithDetails(ex)
            }
          }

          if (!hasNewFrame) {
            const isConfirmedNewFrame = this.isNewFrame(this.oldLines, lines)
            if (isConfirmedNewFrame) {
              newVideoFrameCount++
              hasNewFrame = true
            }
          }
          //performance.mark('comparing-compare-end')

          if (hasNewFrame) {
            this.oldLines = lines
          }
        }
      }
    } else if (this.frameSync == 100) {
      hasNewFrame = true
    }
    
    if(this.getImageDataAllowed && hasNewFrame && this.detectHorizontalBarSizeEnabled) {
      try {
        const lines = []
        let partSize = Math.ceil(this.videoSnapshotBuffer.elem.width / 6)
        for (let i = partSize; i < this.videoSnapshotBuffer.elem.width; i += partSize) {
          lines.push(this.videoSnapshotBuffer.ctx.getImageData(i, 0, 1, this.videoSnapshotBuffer.elem.height).data)
        }
        if(this.detectHorizontalBarSize(lines)) {
          return this.drawAmbilight()
        }
      } catch (ex) {
        if (!this.showedCompareWarning) {
          this.showedCompareWarning = true
          console.warn('Failed to retrieve video data. ', ex)
          AmbilightSentry.captureExceptionWithDetails(ex)
        }
      }
    }
    
    const skippedFrames = (this.videoFrameCount > 120 && this.videoFrameCount < newVideoFrameCount - 1)
    if (skippedFrames) {
      this.skippedFramesCount += newVideoFrameCount - (this.videoFrameCount + 1)
    }
    if (newVideoFrameCount > this.videoFrameCount) {
      this.videoFrameCount = newVideoFrameCount
    }

    if (this.frameBlending && !this.videoElem.paused) {
      if (!this.previousProjectorBuffer) {
        this.initFrameBlending()
      }

      const drawTime = performance.now()
      if (hasNewFrame) {
        this.previousFrameTime = this.previousDrawTime

        if (this.videoOverlayEnabled) {
          this.previousVideoOverlayBuffer.ctx.drawImage(this.videoOverlayBuffer.elem, 0, 0)
          this.videoOverlayBuffer.ctx.drawImage(this.videoElem, 
            0, 0, this.videoOverlayBuffer.elem.width, this.videoOverlayBuffer.elem.height)
        }
        this.previousProjectorBuffer.ctx.drawImage(this.projectorBuffer.elem, 0, 0)
        this.projectorBuffer.ctx.drawImage(this.videoSnapshotBuffer.elem,
          0,
          this.videoSnapshotBufferBarsClipPx,
          this.videoSnapshotBuffer.elem.width,
          this.videoSnapshotBuffer.elem.height - (this.videoSnapshotBufferBarsClipPx * 2),
          0, 0, this.projectorBuffer.elem.width, this.projectorBuffer.elem.height)
      }
      const frameDuration = (drawTime - this.previousFrameTime)
      let alpha =  1
      if(!this.buffersCleared && (this.displayFrameRate >= this.videoFrameRate * 1.33))
        alpha = Math.min(
          1, 
          (
            frameDuration / 
            (
              1000 / 
              (
                this.videoFrameRate / 
                (this.frameBlendingSmoothness / 100) || 1
              )
            )
          )
        )

      if (this.videoOverlayEnabled && this.videoOverlay) {
        this.videoOverlay.ctx.globalAlpha = 1
        this.videoOverlay.ctx.drawImage(this.previousVideoOverlayBuffer.elem, 0, 0)
        this.videoOverlay.ctx.globalAlpha = alpha
        this.videoOverlay.ctx.drawImage(this.videoOverlayBuffer.elem, 0, 0)
        this.videoOverlay.ctx.globalAlpha = 1

        this.checkIfNeedToHideVideoOverlay()
      }

      this.blendedProjectorBuffer.ctx.globalAlpha = 1
      this.blendedProjectorBuffer.ctx.drawImage(this.previousProjectorBuffer.elem, 0, 0)
      this.blendedProjectorBuffer.ctx.globalAlpha = alpha
      this.blendedProjectorBuffer.ctx.drawImage(this.projectorBuffer.elem, 0, 0)
      this.blendedProjectorBuffer.ctx.globalAlpha = 1
      this.projectors.forEach((projector) => {
        projector.ctx.drawImage(this.blendedProjectorBuffer.elem, 0, 0)
      })
      this.previousDrawTime = drawTime
    } else {
      if (!hasNewFrame) return

      if (this.videoOverlayEnabled && this.videoOverlay) {
        this.videoOverlay.ctx.drawImage(this.videoElem, 
          0, 0, this.videoOverlay.elem.width, this.videoOverlay.elem.height)
        this.checkIfNeedToHideVideoOverlay()
      }

      this.projectorBuffer.ctx.drawImage(this.videoSnapshotBuffer.elem,
        0,
        this.videoSnapshotBufferBarsClipPx,
        this.videoSnapshotBuffer.elem.width,
        this.videoSnapshotBuffer.elem.height - (this.videoSnapshotBufferBarsClipPx * 2), 
        0, 0, this.projectorBuffer.elem.width, this.projectorBuffer.elem.height)

      this.projectors.forEach((projector) => {
        projector.ctx.drawImage(this.projectorBuffer.elem, 0, 0)
      })
    }

    this.ambilightFrameCount++

    this.buffersCleared = false

    if(this.enableMozillaBug1606251Workaround) {
      this.elem.style.transform = `translateZ(${this.ambilightFrameCount % 10}px)`;
    }
  }

  detectHorizontalBarSize(imageVLines) {
    let sizes = []
    const colorIndex = (4* 4)
    let color = this.detectColoredHorizontalBarSizeEnabled ?
      [imageVLines[0][colorIndex], imageVLines[0][colorIndex + 1], imageVLines[0][colorIndex + 2]] :
      [2,2,2]
    const maxColorDeviation = 8
    
    for(const line of imageVLines) {
      for (let i = 0; i < line.length; i += 4) {
        if(
          Math.abs(line[i] - color[0]) <= maxColorDeviation && 
          Math.abs(line[i+1] - color[1]) <= maxColorDeviation && 
          Math.abs(line[i+2] - color[2]) <= maxColorDeviation
        ) continue;
        const size = i ? (i / 4) : 0
        sizes.push(size)
        break;
      }
      for (let i = line.length - 1; i >= 0; i -= 4) {
        if(
          Math.abs(line[i-3] - color[0]) <= maxColorDeviation && 
          Math.abs(line[i-2] - color[1]) <= maxColorDeviation && 
          Math.abs(line[i-1] - color[2]) <= maxColorDeviation
        ) continue;
        const j = (line.length - 1) - i;
        const size = j ? (j / 4) : 0
        sizes.push(size)
        break;
      }
    }

    if(!sizes.length) {
      return
    }

    const averageSize = (sizes.reduce((a, b) => a + b, 0) / sizes.length)
    sizes = sizes.sort((a, b) => {
      const aGap = Math.abs(averageSize - a)
      const bGap = Math.abs(averageSize - b)
      return (aGap === bGap) ? 0 : (aGap > bGap) ? 1 : -1
    }).splice(0, 6)
    const maxDeviation = Math.abs(Math.min(...sizes) - Math.max(...sizes))
    const height = (imageVLines[0].length / 4)
    const allowed = height * 0.01
    const valid = (maxDeviation <= allowed)
    
    let size = 0;
    if(!valid) {
      let lowestSize = Math.min(...sizes)
      let lowestPercentage = Math.round((lowestSize / height) * 10000) / 100
      if(lowestPercentage >= this.horizontalBarsClipPercentage - 4) {
        return
      }

      size = lowestSize
    } else {
      size = Math.max(...sizes)// (sizes.reduce((a, b) => a + b, 0) / sizes.length)
    }

    
    if(size < (height * 0.01)) {
      size = 0
    } else {
      size += (height * 0.004) + (height * (this.detectHorizontalBarSizeOffsetPercentage/100))
    }
    
    let percentage = Math.round((size / height) * 10000) / 100
    percentage = Math.min(percentage, 49) === 49 ? 0 : percentage

    const adjustment = (percentage - this.horizontalBarsClipPercentage)
    if(
      (percentage > 25) ||
      (adjustment > -1 && adjustment <= 0)
    ) {
      return
    }

    this.setHorizontalBars(percentage)
    return true
  }

  checkIfNeedToHideVideoOverlay() {
    var ambilightFramesAdded = this.ambilightFrameCount - this.prevAmbilightFrameCountForShouldHideDetection
    var videoFramesAdded = this.videoFrameCount - this.prevVideoFrameCountForShouldHideDetection
    var canChange = (performance.now() - this.videoOverlay.isHiddenChangeTimestamp) > 2000
    var outSyncCount = this.syncInfo.filter(value => !value).length
    var outSyncMaxFrames = this.syncInfo.length * (this.videoOverlaySyncThreshold / 100)

    if (this.videoElem.paused || (outSyncCount > outSyncMaxFrames && this.videoOverlaySyncThreshold !== 100)) {
      if (!this.videoOverlay.isHidden) {
        this.videoOverlay.elem.class('ambilight__video-overlay--hide')
        this.videoOverlay.isHidden = true
        this.videoOverlay.isHiddenChangeTimestamp = performance.now()
        this.detectVideoSynced()
      }
    } else if (canChange || this.videoOverlaySyncThreshold == 100) {
      if (this.videoOverlay.isHidden) {
        this.videoOverlay.elem.removeClass('ambilight__video-overlay--hide')
        this.videoOverlay.isHidden = false
        this.videoOverlay.isHiddenChangeTimestamp = performance.now()
        this.detectVideoSynced()
      }
    }

    this.syncInfo.push(!(ambilightFramesAdded < videoFramesAdded))
    var syncInfoBufferLength = Math.min(120, Math.max(48, this.videoFrameRate * 2))
    if (this.syncInfo.length > syncInfoBufferLength) {
      this.syncInfo.splice(0, 1)
    }
    this.prevAmbilightFrameCountForShouldHideDetection = this.ambilightFrameCount
    this.prevVideoFrameCountForShouldHideDetection = this.videoFrameCount
  }

  enable(initial = false) {
    if (this.enabled && !initial) return

    this.setSetting('enabled', true)
    const enabledInput = $.s(`#setting-enabled`)
    if(enabledInput) enabledInput.attr('aria-checked', true)

    html.attr('data-ambilight-enabled', true)

    if (!initial) {
      const toLight = !html.attr('dark')
      this.resetThemeToLightOnDisable = toLight
      this.setSetting('resetThemeToLightOnDisable', toLight)
      const resetInput = $.s(`#setting-resetThemeToLightOnDisable`)
      if(resetInput) resetInput.attr('aria-checked', toLight)
    }

    this.resetSettingsIfNeeded()
    this.checkVideoSize()
    this.start()
  }

  disable() {
    if (!this.enabled) return

    this.setSetting('enabled', false)
    const enabledInput = $.s(`#setting-enabled`)
    if(enabledInput) enabledInput.attr('aria-checked', false)
    html.attr('data-ambilight-enabled', false)

    if (this.resetThemeToLightOnDisable) {
      this.resetThemeToLightOnDisable = undefined
      Ambilight.setDarkTheme(false)
    }

    this.videoElem.style.marginTop = ''
    const videoElemParentElem = this.videoElem.parentNode
    if (videoElemParentElem) {
      videoElemParentElem.style.overflow = ''
      videoElemParentElem.style.marginTop = ''
      videoElemParentElem.style.height = ''
      videoElemParentElem.style.marginBottom = ''
    }

    this.checkVideoSize()
    this.hide()
  }

  static setDarkTheme(value) {
    try {
      if (Ambilight.isClassic) return
      if (Ambilight.setDarkThemeBusy) return
      if (html.attr('dark')) {
        if (value) return
      } else {
        if (!value) return
      }
      if (value && !$.s('ytd-app').hasAttribute('is-watch-page')) return
      Ambilight.setDarkThemeBusy = true

      const toggle = (rendererElem) => {
        rendererElem = rendererElem || $.s('ytd-toggle-theme-compact-link-renderer')
        if (value) {
          rendererElem.handleSignalActionToggleDarkThemeOn()
        } else {
          rendererElem.handleSignalActionToggleDarkThemeOff()
        }
        Ambilight.setDarkThemeBusy = false
      }

      const rendererElem = $.s('ytd-toggle-theme-compact-link-renderer')
      if (rendererElem) {
        toggle(rendererElem)
      } else {
        const findBtn = () => $.s('#avatar-btn') || // When logged in
          $.s('.ytd-masthead#buttons ytd-topbar-menu-button-renderer:last-of-type') // When not logged in

        $.s('ytd-popup-container').style.opacity = 0
        waitForDomElement(
          findBtn,
          'ytd-masthead',
          () => {
            waitForDomElement(
              () => {
                const rendererElem = $.s('ytd-toggle-theme-compact-link-renderer')
                return (rendererElem && rendererElem.handleSignalActionToggleDarkThemeOn)
              },
              'ytd-popup-container',
              () => {
                findBtn().click()
                toggle()
                setTimeout(() => {
                  $.s('ytd-popup-container').style.opacity = ''
                  previousActiveElement.focus()
                }, 1)
              })
            let previousActiveElement = document.activeElement
            findBtn().click()
          }
        )
      }
    } catch (ex) {
      console.error('Error while setting dark mode', ex)
      AmbilightSentry.captureExceptionWithDetails(ex)
      Ambilight.setDarkThemeBusy = false
    }
  }

  toggleEnabled() {
    if (this.enabled)
      this.disable()
    else
      this.enable()
  }

  start() {
    if (!this.isOnVideoPage || !this.enabled) return

    this.videoFrameRateMeasureStartFrame = 0
    this.videoFrameRateMeasureStartTime = 0
    this.showedCompareWarning = false

    if (!html.attr('dark')) {
      Ambilight.setDarkTheme(true)
    }
    
    if(!this.detectDisplayFrameRateScheduled) {
      this.detectDisplayFrameRateScheduled = true
      raf(this.detectDisplayFrameRate)
    }

    this.scheduleNextFrame()
  }


  hide() {
    if (this.isHidden) return
    this.isHidden = true
    this.elem.style.opacity = 0.0000001; //Avoid memory leak https://codepen.io/wesselkroos/pen/MWWorLW
    if (this.videoOverlay && this.videoOverlay.elem.parentNode) {
      this.videoOverlay.elem.parentNode.removeChild(this.videoOverlay.elem)
    }
    setTimeout(() => {
      this.clear()
      this.hideFPS()
    }, 500)

    html.attr('data-ambilight-enabled', false)
    html.attr('data-ambilight-classic', false)
    if(Ambilight.isClassic) {
      html.attr('dark', false)
    }
    if (this.resetThemeToLightOnDisable) {
      this.resetThemeToLightOnDisable = undefined
      Ambilight.setDarkTheme(false)
    }
  }

  show() {
    this.isHidden = false
    this.elem.style.opacity = 1
    Ambilight.setDarkTheme(true)
    html.attr('data-ambilight-enabled', true)
    html.attr('data-ambilight-classic', Ambilight.isClassic)
    if(Ambilight.isClassic) {
      html.attr('dark', true)
    }
  }


  initScrollPosition() {
    this.mastheadElem = Ambilight.isClassic ? $.s('#yt-masthead-container') : $.s('#masthead-container')

    window.on('scroll', () => {
      if (this.changedTopTimeout)
        clearTimeout(this.changedTopTimeout)

      this.changedTopTimeout = setTimeout(() => {
        this.checkScrollPosition()
        this.changedTopTimeout = undefined
      }, 100)
    })
    this.checkScrollPosition()
  }

  checkScrollPosition() {
    if (!this.immersive)
      body.removeClass('at-top').removeClass('not-at-top')

    if (window.scrollY > 0) {
      this.mastheadElem.class('not-at-top').removeClass('at-top')
      if (this.immersive)
        body.class('not-at-top').removeClass('at-top')
    } else {
      this.mastheadElem.class('at-top').removeClass('not-at-top')
      if (this.immersive)
        body.class('at-top').removeClass('not-at-top')
    }
  }

  initImmersiveMode() {
    if (this.immersive)
      html.attr('data-ambilight-immersive-mode', true)
  
    this.checkScrollPosition()
  }

  toggleImmersiveMode() {
    const enabled = !this.immersive
    html.attr('data-ambilight-immersive-mode', enabled)
    $.s(`#setting-immersive`).attr('aria-checked', enabled ? 'true' : 'false')
    this.setSetting('immersive', enabled)
    window.dispatchEvent(new Event('resize'))
    window.dispatchEvent(new Event('scroll'))
  }
}