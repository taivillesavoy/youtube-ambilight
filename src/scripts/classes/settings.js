export default class Settings {
  constructor() {
    this.settings = [
      {
        type: 'section',
        label: 'Settings',
        name: 'sectionSettingsCollapsed',
        default: true
      },
      {
        name: 'advancedSettings',
        label: 'Advanced',
        type: 'checkbox',
        default: false
      },
      {
        type: 'section',
        label: 'Quality',
        name: 'sectionAmbilightQualityPerformanceCollapsed',
        default: true,
        advanced: false
      },
      {
        name: 'showFPS',
        label: 'Show framerate',
        type: 'checkbox',
        default: false,
        advanced: true
      },
      {
        name: 'frameSync',
        label: '<span style="display: inline-block; padding: 5px 0">Synchronization <a title="How much energy will be spent on sychronising the ambilight effect with the video.\n\nPower Saver: Lowest CPU & GPU usage.\nMight result in ambilight with skipped and delayed frames.\n\nBalanced: Medium CPU & GPU usage.\nMight still result in ambilight with delayed frames on higher than 1080p videos.\n\nHigh Performance: Highest CPU & GPU usage.\nMight still result in delayed frames on high refreshrate monitors (120hz and higher) and higher than 1080p videos." href="#" onclick="return false" style="padding: 0 5px;">?</a>',
        type: 'list',
        default: 50,
        min: 0,
        max: 100,
        step: 50,
        advanced: false
      },
      {
        name: 'framerateLimit',
        label: 'Limit framerate (per second)',
        type: 'list',
        default: 0,
        min: 0,
        max: 60,
        step: 1,
        advanced: true
      },
      {
        experimental: true,
        name: 'videoOverlayEnabled',
        label: '<span style="display: inline-block; padding: 5px 0">Sync video with ambilight <a title="Delays the video frames according to the ambilight frametimes. This makes sure that that the ambilight is never out of sync with the video, but it can introduce stuttering and/or skipped frames." href="#" onclick="return false" style="padding: 0 5px;">?</a></span>',
        type: 'checkbox',
        default: false,
        advanced: true
      },
      {
        experimental: true,
        name: 'videoOverlaySyncThreshold',
        label: '<span style="display: inline-block; padding: 5px 0">Sync video disable threshold<br/><span class="ytpa-menuitem-description">(Disable when dropping % of frames)</span></span>',
        type: 'list',
        default: 5,
        min: 1,
        max: 100,
        step: 1,
        advanced: true
      },
      {
        experimental: true,
        name: 'frameBlending',
        label: '<span style="display: inline-block; padding: 5px 0">Smooth motion (frame blending) <a title="Click for more information about Frame blending" href="https://nl.linkedin.com/learning/premiere-pro-guru-speed-changes/frame-sampling-vs-frame-blending" target="_blank" style="padding: 0 5px;">?</a><br/><span class="ytpa-menuitem-description">(More GPU usage. Works with "Sync video")</span></span>',
        type: 'checkbox',
        default: false,
        advanced: true
      },
      {
        experimental: true,
        name: 'frameBlendingSmoothness',
        label: 'Smooth motion strength',
        type: 'list',
        default: 80,
        min: 0,
        max: 100,
        step: 1,
        advanced: true
      },
      {
        type: 'section',
        label: 'Page content',
        name: 'sectionOtherPageContentCollapsed',
        default: false
      },
      {
        name: 'surroundingContentShadowSize',
        label: 'Shadow size<br/><span class="ytpa-menuitem-description">(Can cause scroll stuttering)</span>',
        type: 'list',
        default: 15,
        min: 0,
        max: 100,
        step: .1
      },
      {
        name: 'surroundingContentShadowOpacity',
        label: 'Shadow opacity',
        type: 'list',
        default: 30,
        min: 0,
        max: 100,
        step: .1
      },
      {
        name: 'immersive',
        label: 'Hide when scrolled to top [Z]',
        type: 'checkbox',
        default: false
      },
      {
        name: 'hideScrollbar',
        label: 'Hide scrollbar',
        type: 'checkbox',
        default: false
      },
      {
        type: 'section',
        label: 'Video',
        name: 'sectionVideoResizingCollapsed',
        default: true
      },
      {
        name: 'videoScale',
        label: 'Size',
        type: 'list',
        default: 100,
        min: 25,
        max: 200,
        step: 0.1
      },
      {
        name: 'videoShadowSize',
        label: 'Shadow size',
        type: 'list',
        default: 0,
        min: 0,
        max: 100,
        step: .1
      },
      {
        name: 'videoShadowOpacity',
        label: 'Shadow opacity',
        type: 'list',
        default: 50,
        min: 0,
        max: 100,
        step: .1
      },
      {
        type: 'section',
        label: 'Black bars',
        name: 'sectionBlackBarsCollapsed',
        default: true
      },
      {
        name: 'detectHorizontalBarSizeEnabled',
        label: 'Remove black bars [B]<br/><span class="ytpa-menuitem-description">(More CPU usage)</span>',
        type: 'checkbox',
        default: false
      },
      {
        name: 'detectColoredHorizontalBarSizeEnabled',
        label: 'Also remove colored bars',
        type: 'checkbox',
        default: false
      },
      {
        name: 'detectHorizontalBarSizeOffsetPercentage',
        label: 'Black bar detection offset',
        type: 'list',
        default: 0,
        min: -5,
        max: 5,
        step: 0.1,
        advanced: true
      },
      {
        name: 'horizontalBarsClipPercentage',
        label: 'Black bars size',
        type: 'list',
        default: 0,
        min: 0,
        max: 40,
        step: 0.1,
        snapPoints: [8.7, 12.3, 13.5],
        advanced: true
      },
      {
        name: 'horizontalBarsClipPercentageReset',
        label: 'Reset black bars next video',
        type: 'checkbox',
        default: true,
        advanced: true
      },
      {
        name: 'detectVideoFillScaleEnabled',
        label: 'Fill video to screen width [W]',
        type: 'checkbox',
        default: false
      },
      {
        type: 'section',
        label: 'Filters',
        name: 'sectionAmbilightImageAdjustmentCollapsed',
        default: false,
        advanced: true
      },
      {
        name: 'brightness',
        label: 'Brightness',
        type: 'list',
        default: 100,
        min: 0,
        max: 200,
        advanced: true
      },
      {
        name: 'contrast',
        label: 'Contrast',
        type: 'list',
        default: 100,
        min: 0,
        max: 200,
        advanced: true
      },
      {
        name: 'saturation',
        label: 'Saturation',
        type: 'list',
        default: 100,
        min: 0,
        max: 200,
        advanced: true
      },
      {
        type: 'section',
        label: 'Directions',
        name: 'sectionDirectionsCollapsed',
        default: true,
        advanced: true
      },
      {
        name: 'directionTopEnabled',
        label: 'Top',
        type: 'checkbox',
        default: true,
        advanced: true
      },
      {
        name: 'directionRightEnabled',
        label: 'Right',
        type: 'checkbox',
        default: true,
        advanced: true
      },
      {
        name: 'directionBottomEnabled',
        label: 'Bottom',
        type: 'checkbox',
        default: true,
        advanced: true
      },
      {
        name: 'directionLeftEnabled',
        label: 'Left',
        type: 'checkbox',
        default: true,
        advanced: true
      },
      {
        type: 'section',
        label: 'Ambilight',
        name: 'sectionAmbilightCollapsed',
        default: false
      },
      {
        name: 'blur',
        label: `
          <span style="display: inline-block; padding: 5px 0">Blur<br/>
          <span class="ytpa-menuitem-description">(More GPU memory)</span></span>`,
        type: 'list',
        default: 50,
        min: 0,
        max: 100,
        step: .1
      },
      {
        name: 'spread',
        label: `
          <span style="display: inline-block; padding: 5px 0">Spread<br/>
          <span class="ytpa-menuitem-description">(More GPU usage)</span></span>`,
        type: 'list',
        default: 20,
        min: 0,
        max: 200,
        step: .1
      },
      {
        name: 'edge',
        label: `
          <span style="display: inline-block; padding: 5px 0">Edge size<br/>
          <span class="ytpa-menuitem-description">(Less GPU usage. Tip: Turn blur down)</span></span>`,
        type: 'list',
        default: 17,
        min: 2,
        max: 50,
        step: .1,
        advanced: true
      },
      {
        name: 'bloom',
        label: 'Fade out start',
        type: 'list',
        default: 15,
        min: -50,
        max: 100,
        step: .1,
        advanced: true
      },
      {
        name: 'fadeOutEasing',
        label: `
          <span style="display: inline-block; padding: 5px 0">Fade out curve<br/>
          <span class="ytpa-menuitem-description">(Tip: Turn blur all the way down)</span></span>`,
        type: 'list',
        default: 35,
        min: 1,
        max: 100,
        step: 1,
        advanced: true
      },
      {
        name: 'debandingStrength',
        label: `
          Debanding (noise) 
          <a 
            title="Click for more information about Dithering" 
            href="https://www.lifewire.com/what-is-dithering-4686105" 
            target="_blank" 
            style="padding: 0 5px;">?</a>`,
        type: 'list',
        default: 0,
        min: 0,
        max: 100,
        advanced: true
      },
      {
        type: 'section',
        label: 'General',
        name: 'sectionGeneralCollapsed',
        default: false
      },
      {
        name: 'resetThemeToLightOnDisable',
        label: 'Switch to light theme when turned off',
        type: 'checkbox',
        default: false,
        advanced: false
      },
      {
        name: 'enableInFullscreen',
        label: `
          <span style="display: inline-block; padding: 5px 0">
            Enable in fullscreen<br/>
            <span class="ytpa-menuitem-description">(When in fullscreen mode)</span>
          </span>`,
        type: 'checkbox',
        default: true,
        advanced: true
      },
      {
        name: 'enabled',
        label: 'Enabled [A]',
        type: 'checkbox',
        default: true
      },
    ]

    this.videoHasRequestAnimationFrame = !!this.videoElem.requestAnimationFrame
    this.settings = this.settings.map(setting => {
      if(this.videoHasRequestAnimationFrame) {
        if(setting.name === 'frameSync') {
          return undefined
        }
        if(setting.name === 'sectionAmbilightQualityPerformanceCollapsed') {
          setting.advanced = true
        }
      }
      return setting
    }).filter(setting => setting)

    this.getAllSettings()
    this.initSettingsMenu()
  }

  getAllSettings() {
    this.enabled = this.getSetting('enabled')
    html.attr('data-ambilight-enabled', this.enabled)

    //Sections
    this.sectionSettingsCollapsed = this.getSetting('sectionSettingsCollapsed')
    this.sectionAmbilightCollapsed = this.getSetting('sectionAmbilightCollapsed')
    this.sectionDirectionsCollapsed = this.getSetting('sectionDirectionsCollapsed')
    this.sectionAmbilightImageAdjustmentCollapsed = this.getSetting('sectionAmbilightImageAdjustmentCollapsed')
    this.sectionVideoResizingCollapsed = this.getSetting('sectionVideoResizingCollapsed')
    this.sectionBlackBarsCollapsed = this.getSetting('sectionBlackBarsCollapsed')
    this.sectionOtherPageContentCollapsed = this.getSetting('sectionOtherPageContentCollapsed')
    this.sectionAmbilightQualityPerformanceCollapsed = this.getSetting('sectionAmbilightQualityPerformanceCollapsed')
    this.sectionGeneralCollapsed = this.getSetting('sectionGeneralCollapsed')

    this.spread = this.getSetting('spread')
    this.blur = this.getSetting('blur')
    this.bloom = this.getSetting('bloom')
    this.fadeOutEasing = this.getSetting('fadeOutEasing')
    this.edge = this.getSetting('edge')
    this.innerStrength = 2
    this.videoOverlayEnabled = this.getSetting('videoOverlayEnabled')
    this.videoOverlaySyncThreshold = this.getSetting('videoOverlaySyncThreshold')

    this.contrast = this.getSetting('contrast')
    this.brightness = this.getSetting('brightness')
    this.saturation = this.getSetting('saturation')

    this.videoScale = this.getSetting('videoScale')
    this.detectHorizontalBarSizeEnabled = this.getSetting('detectHorizontalBarSizeEnabled')
    this.detectColoredHorizontalBarSizeEnabled = this.getSetting('detectColoredHorizontalBarSizeEnabled')
    this.detectHorizontalBarSizeOffsetPercentage = this.getSetting('detectHorizontalBarSizeOffsetPercentage')
    this.horizontalBarsClipPercentage = this.getSetting('horizontalBarsClipPercentage')
    this.detectVideoFillScaleEnabled = this.getSetting('detectVideoFillScaleEnabled')
    this.horizontalBarsClipPercentageReset = this.getSetting('horizontalBarsClipPercentageReset')

    this.directionTopEnabled = this.getSetting('directionTopEnabled')
    this.directionRightEnabled = this.getSetting('directionRightEnabled')
    this.directionBottomEnabled = this.getSetting('directionBottomEnabled')
    this.directionLeftEnabled = this.getSetting('directionLeftEnabled')

    //// Migrations from version 2.32
    // Enable advancedSettings for existing users
    let previouslyEnabled = false
    let previouslyAdvancedSettings = false
    try {
      previouslyEnabled = localStorage.getItem(`ambilight-enabled`)
      previouslyAdvancedSettings = localStorage.getItem(`ambilight-advancedSettings`)
    } catch (ex) {
      console.warn('YouTube Ambilight | getSetting', ex)
      //AmbilightSentry.captureExceptionWithDetails(ex)
    }
    if(previouslyAdvancedSettings === null) {
      this.setSetting('advancedSettings', (previouslyEnabled !== null))
    } else {
      this.advancedSettings = this.getSetting('advancedSettings')
    }

    // Migrate highQuality to frameSync
    const previouslyHighQuality = this.getSetting('highQuality')
    if(previouslyHighQuality === 'false') {
      this.setSetting('frameSync', 0)
      this.removeSetting('highQuality')
    } else {
      this.frameSync = this.getSetting('frameSync')
    }

    this.framerateLimit = this.getSetting('framerateLimit')
    this.frameBlending = this.getSetting('frameBlending')
    this.frameBlendingSmoothness = this.getSetting('frameBlendingSmoothness')
    this.immersive = this.getSetting('immersive')
    this.hideScrollbar = this.getSetting('hideScrollbar')
    html.attr('data-ambilight-hide-scrollbar', this.hideScrollbar)
    this.enableInFullscreen = this.getSetting('enableInFullscreen')
    this.resetThemeToLightOnDisable = this.getSetting('resetThemeToLightOnDisable')
    this.showFPS = this.getSetting('showFPS')

    this.surroundingContentShadowSize = this.getSetting('surroundingContentShadowSize')
    this.surroundingContentShadowOpacity = this.getSetting('surroundingContentShadowOpacity')
    this.debandingStrength = this.getSetting('debandingStrength')

    this.videoShadowSize = this.getSetting('videoShadowSize')
    this.videoShadowOpacity = this.getSetting('videoShadowOpacity')

    this.settings.forEach(setting => {
      setting.value = this[setting.name]
    })
  }



  initSettingsMenu() {
    this.settingsMenuBtn = $.create('button')
      .class('ytp-button ytp-ambilight-settings-button')
      .attr('title', 'Ambilight settings')
      .attr('aria-owns', 'ytp-id-190')
      .on('click', this.onSettingsBtnClicked, (listener) => this.onSettingsBtnClickedListener = listener)

    this.settingsMenuBtn.innerHTML = `<svg height="100%" version="1.1" viewBox="0 0 36 36" width="100%">
      <path d="m 23.94,18.78 c .03,-0.25 .05,-0.51 .05,-0.78 0,-0.27 -0.02,-0.52 -0.05,-0.78 l 1.68,-1.32 c .15,-0.12 .19,-0.33 .09,-0.51 l -1.6,-2.76 c -0.09,-0.17 -0.31,-0.24 -0.48,-0.17 l -1.99,.8 c -0.41,-0.32 -0.86,-0.58 -1.35,-0.78 l -0.30,-2.12 c -0.02,-0.19 -0.19,-0.33 -0.39,-0.33 l -3.2,0 c -0.2,0 -0.36,.14 -0.39,.33 l -0.30,2.12 c -0.48,.2 -0.93,.47 -1.35,.78 l -1.99,-0.8 c -0.18,-0.07 -0.39,0 -0.48,.17 l -1.6,2.76 c -0.10,.17 -0.05,.39 .09,.51 l 1.68,1.32 c -0.03,.25 -0.05,.52 -0.05,.78 0,.26 .02,.52 .05,.78 l -1.68,1.32 c -0.15,.12 -0.19,.33 -0.09,.51 l 1.6,2.76 c .09,.17 .31,.24 .48,.17 l 1.99,-0.8 c .41,.32 .86,.58 1.35,.78 l .30,2.12 c .02,.19 .19,.33 .39,.33 l 3.2,0 c .2,0 .36,-0.14 .39,-0.33 l .30,-2.12 c .48,-0.2 .93,-0.47 1.35,-0.78 l 1.99,.8 c .18,.07 .39,0 .48,-0.17 l 1.6,-2.76 c .09,-0.17 .05,-0.39 -0.09,-0.51 l -1.68,-1.32 0,0 z m -5.94,2.01 c -1.54,0 -2.8,-1.25 -2.8,-2.8 0,-1.54 1.25,-2.8 2.8,-2.8 1.54,0 2.8,1.25 2.8,2.8 0,1.54 -1.25,2.8 -2.8,2.8 l 0,0 z" fill="#fff"></path>
    </svg>`

    this.settingsMenuBtnParent = $.s('.ytp-right-controls, .ytp-chrome-controls > *:last-child')
    this.settingsMenuBtn.prependTo(this.settingsMenuBtnParent)


    this.settingsMenuElem = $.create('div')
      .class(`ytp-popup ytp-settings-menu ytpa-ambilight-settings-menu ${
        (this.advancedSettings) ? 'ytpa-ambilight-settings-menu--advanced' : ''
      }`)
      .attr('id', 'ytp-id-190')
    this.settingsMenuElem.innerHTML = `
      <div class="ytp-panel">
        <div class="ytp-panel-menu" role="menu">
          <a class="ytpa-feedback-link" rowspan="2" href="${this.feedbackFormLink}" target="_blank">
            <span class="ytpa-feedback-link__text">Give feedback or rate YouTube Ambilight</span>
          </a>
          ${
      this.settings.map(setting => {
        let classes = 'ytp-menuitem'
        if(setting.advanced) classes += ' ytpa-menuitem--advanced'
        if(setting.new) classes += ' ytpa-menuitem--new'
        if(setting.experimental) classes += ' ytpa-menuitem--experimental'

        if (setting.type === 'checkbox') {
          return `
            <div id="setting-${setting.name}" 
            class="${classes}" 
            role="menuitemcheckbox" 
            aria-checked="${setting.value ? 'true' : 'false'}" 
            tabindex="0">
              <div class="ytp-menuitem-label">${setting.label}</div>
              <div class="ytp-menuitem-content">
                <div class="ytp-menuitem-toggle-checkbox"></div>
              </div>
            </div>
          `
        } else if (setting.type === 'list') {
          return `
            <div id="setting-${setting.name}" class="ytp-menuitem-range-wrapper">
              <div class="${classes}" aria-haspopup="false" role="menuitemrange" tabindex="0">
                <div class="ytp-menuitem-label">${setting.label}</div>
                <div id="setting-${setting.name}-value" class="ytp-menuitem-content">${this.getSettingListDisplayText(setting)}</div>
              </div>
              <div 
              class="ytp-menuitem-range ${setting.snapPoints ? 'ytp-menuitem-range--has-snap-points' : ''}" 
              rowspan="2" 
              title="Double click to reset">
                <input 
                  id="setting-${setting.name}-range" 
                  type="range" 
                  min="${setting.min}" 
                  max="${setting.max}" 
                  colspan="2" 
                  value="${setting.value}" 
                  step="${setting.step || 1}" />
              </div>
              ${!setting.snapPoints ? '' : `
                <datalist class="setting-range-datalist" id="snap-points-${setting.name}">
                  ${setting.snapPoints.map((point, i) => `
                    <option 
                      class="setting-range-datalist__label ${(point < setting.snapPoints[i - 1] + 2) ? 'setting-range-datalist__label--flip' : ''}" 
                      value="${point}" 
                      label="${Math.floor(point)}" 
                      title="Snap to ${point}" 
                      style="margin-left: ${(point + (-setting.min)) * (100 / (setting.max - setting.min))}%">
                      ${Math.floor(point)}
                    </option>
                  `).join('')}
                </datalist>
              `}
            </div>
          `
        } else if (setting.type === 'section') {
          return `
            <div 
              class="ytpa-section ${setting.value ? 'is-collapsed' : ''} ${setting.advanced ? 'ytpa-section--advanced' : ''}" 
              data-name="${setting.name}">
              <div class="ytpa-section__cell">
                <div class="ytpa-section__label">${setting.label}</div>
              </div>
              <div class="ytpa-section__cell">
                <div class="ytpa-section__fill">-</div>
              </div>
            </div>
          `
        }
      }).join('')
          }
        </div>
      </div>`
    this.settingsMenuElem.querySelectorAll('.setting-range-datalist__label').forEach(label => {
      label.on('click', (e) => {
        const value = e.target.value
        const name = e.target.parentNode.id.replace('snap-points-', '')
        const inputElem = document.querySelector(`#setting-${name}-range`)
        inputElem.value = value
        inputElem.dispatchEvent(new Event('change', { bubbles: true }))
      })
    })
    this.settingsMenuElem.querySelectorAll('.ytpa-section').forEach(section => {
      section.on('click', (e) => {
        const name = section.attr('data-name')
        const settingSection = this.settings.find(setting => setting.type == 'section' && setting.name == name)
        if (!settingSection) return
        settingSection.value = !settingSection.value
        this.setSetting(name, settingSection.value)

        if (settingSection.value) {
          section.class('is-collapsed')
        } else {
          section.removeClass('is-collapsed')
        }
      })
    })
    this.settingsMenuElemParent = $.s('.html5-video-player')
    this.settingsMenuElem.prependTo(this.settingsMenuElemParent)
    try {
      this.settingsMenuElem.scrollTop = this.settingsMenuElem.scrollHeight
      this.settingsMenuOnCloseScrollBottom = (!this.settingsMenuElem.scrollTop) 
        ? -1 
        : (this.settingsMenuElem.scrollHeight - this.settingsMenuElem.offsetHeight) - this.settingsMenuElem.scrollTop
      this.settingsMenuOnCloseScrollHeight = (this.settingsMenuElem.scrollHeight - this.settingsMenuElem.offsetHeight)
    } catch(ex) {
      console.error('YouTube Ambilight | initSettingsMenuScrollInformation', ex)
      AmbilightSentry.captureExceptionWithDetails(ex)
    }

    this.settings.forEach(setting => {
      if (setting.type === 'list') {
        const inputElem = $.s(`#setting-${setting.name}-range`)
        const displayedValue = $.s(`#setting-${setting.name}-value`)
        inputElem.on('change mousemove dblclick touchmove', (e) => {
          if(e.type === 'mousemove' && e.buttons === 0) return

          let value = inputElem.value
          if (e.type === 'dblclick') {
            value = this.settings.find(s => s.name === setting.name).default
          } else if (inputElem.value === inputElem.attr('data-previous-value')) {
            return
          }
          inputElem.value = value
          inputElem.attr('data-previous-value', value)
          this.setSetting(setting.name, value)
          displayedValue.textContent = this.getSettingListDisplayText({...setting, value})

          if (
            setting.name === 'surroundingContentShadowSize' ||
            setting.name === 'surroundingContentShadowOpacity' ||
            setting.name === 'debandingStrength' ||
            setting.name === 'videoShadowSize' ||
            setting.name === 'videoShadowOpacity' ||
            setting.name === 'videoScale'
          ) {
            this.updateStyles()
          }

          if (
            setting.name === 'spread' || 
            setting.name === 'edge' || 
            setting.name === 'fadeOutEasing'
          ) {
            this.canvassesInvalidated = true
          }

          if(!this.advancedSettings) {
            if(setting.name === 'blur') {
              const edgeSetting = this.settings.find(setting => setting.name === 'edge')
              const edgeValue = (value <= 5 ) ? 2 : ((value >= 42.5) ? 17 : (
                value/2.5
              ))

              const edgeInputElem = $.s(`#setting-${edgeSetting.name}-range`)
              edgeInputElem.value = edgeValue
              edgeInputElem.dispatchEvent(new Event('change', { bubbles: true }))
            }
          }

          if(setting.name === 'horizontalBarsClipPercentage' && this.detectHorizontalBarSizeEnabled) {
            const controllerInput = $.s(`#setting-detectHorizontalBarSizeEnabled`)
            controllerInput.dontResetControlledSetting = true
            controllerInput.click()
          }

          if(setting.name === 'videoScale') {
            if(this.detectVideoFillScaleEnabled) {
              const controllerInput = $.s(`#setting-detectVideoFillScaleEnabled`)
              controllerInput.dontResetControlledSetting = true
              controllerInput.click()
            }
          }

          this.sizesInvalidated = true
          this.scheduleNextFrame()
        })
      } else if (setting.type === 'checkbox') {
        const inputElem = $.s(`#setting-${setting.name}`)
        inputElem.on('click', () => {
          if (setting.type === 'checkbox') {
            setting.value = !setting.value
          }

          if (setting.name === 'enabled') {
            if (setting.value)
              this.enable()
            else
              this.disable()
          }
          if (setting.name === 'immersive') {
            this.toggleImmersiveMode()
          }
          if (setting.name === 'hideScrollbar') {
            html.attr('data-ambilight-hide-scrollbar', setting.value)
          }
          if (
            setting.name === 'videoOverlayEnabled' ||
            setting.name === 'frameSync' ||
            setting.name === 'frameBlending' ||
            setting.name === 'enableInFullscreen' ||
            setting.name === 'showFPS' ||
            setting.name === 'resetThemeToLightOnDisable' ||
            setting.name === 'horizontalBarsClipPercentageReset' ||
            setting.name === 'detectHorizontalBarSizeEnabled' ||
            setting.name === 'detectColoredHorizontalBarSizeEnabled' ||
            setting.name === 'detectVideoFillScaleEnabled' ||
            setting.name === 'directionTopEnabled' ||
            setting.name === 'directionRightEnabled' ||
            setting.name === 'directionBottomEnabled' ||
            setting.name === 'directionLeftEnabled' ||
            setting.name === 'advancedSettings' ||
            setting.name === 'hideScrollbar'
          ) {
            this.setSetting(setting.name, setting.value)
            $.s(`#setting-${setting.name}`).attr('aria-checked', setting.value)
          }

          if(setting.name === 'detectHorizontalBarSizeEnabled') {
            if(!setting.value) {
              if(!inputElem.dontResetControlledSetting) {
                const horizontalBarsClipPercentageSetting = this.settings.find(setting => setting.name === 'horizontalBarsClipPercentage')
                const horizontalBarsClipPercentageInputElem = $.s(`#setting-${horizontalBarsClipPercentageSetting.name}-range`)
                horizontalBarsClipPercentageInputElem.value = horizontalBarsClipPercentageSetting.default
                horizontalBarsClipPercentageInputElem.dispatchEvent(new Event('change', { bubbles: true }))
                this.setSetting('horizontalBarsClipPercentage', horizontalBarsClipPercentageSetting.default)
              }
            } else {
              if(this.videoElem.paused) {
                this.start()
              }
            }
            if(inputElem.dontResetControlledSetting) {
              delete inputElem.dontResetControlledSetting
            }
            this.updateControlledSettings()
          }

          if(setting.name === 'detectVideoFillScaleEnabled') {
            if(!setting.value) {
              if(!inputElem.dontResetControlledSetting) {
                const videoScaleSetting = this.settings.find(setting => setting.name === 'videoScale')
                const videoScaleInputElem = $.s(`#setting-${videoScaleSetting.name}-range`)
                videoScaleInputElem.value = videoScaleSetting.default
                videoScaleInputElem.dispatchEvent(new Event('change', { bubbles: true }))
                this.setSetting('videoScale', videoScaleSetting.default)
              }
            }
            if(inputElem.dontResetControlledSetting) {
              delete inputElem.dontResetControlledSetting
            }
            this.updateControlledSettings()
          }

          if(setting.name === 'advancedSettings') {
            if(setting.value) {
              this.settingsMenuElem.class('ytpa-ambilight-settings-menu--advanced')
            } else {
              this.settingsMenuElem.removeClass('ytpa-ambilight-settings-menu--advanced')
            }
          }

          if (setting.name === 'showFPS' && !setting.value) {
            this.hideFPS()
          }

          this.updateSizes()
        })
      }
    })

    this.updateControlledSettings()
  }

  updateControlledSettings() {
    if(!this.detectVideoFillScaleEnabled) {
      $.s(`#setting-videoScale-value`)
        .removeClass('is-controlled-by-setting')
        .attr('title', '')
    } else {
      $.s(`#setting-videoScale-value`)
        .class('is-controlled-by-setting')
        .attr('title', 'Controlled by the "Fill video to screen width" setting.\nManually adjusting this setting will turn off "Fill video to screen width"')
    }

    if(!this.detectHorizontalBarSizeEnabled) {
      $.s(`#setting-horizontalBarsClipPercentage-value`)
        .removeClass('is-controlled-by-setting')
        .attr('title', '')
    } else {
      $.s(`#setting-horizontalBarsClipPercentage-value`)
        .class('is-controlled-by-setting')
        .attr('title', 'Controlled by the "Remove black bars" setting.\nManually adjusting this setting will turn off "Remove black bars"')
    }
  }

  getSettingListDisplayText(setting) {
    if (setting.name === 'frameSync') {
      if (setting.value == 0)
        return 'Power Saver'
      if (setting.value == 50)
        return 'Balanced'
      if (setting.value == 100)
        return 'High Performance'
    }
    if(setting.name === 'framerateLimit') {
      return (this.framerateLimit == 0) ? 'max fps' : `${setting.value} fps`
    }
    return `${setting.value}%`
  }

  settingsMenuOnCloseScrollBottom = 0
  settingsMenuOnCloseScrollHeight = 0
  onSettingsBtnClicked = () => {
    const isOpen = this.settingsMenuElem.classList.contains('is-visible')
    if (isOpen) return

    this.settingsMenuElem.removeClass('fade-out').class('is-visible')

    if(this.settingsMenuOnCloseScrollBottom !== -1) {
      const percentage = (this.settingsMenuElem.scrollHeight) / this.settingsMenuOnCloseScrollHeight
      this.settingsMenuElem.scrollTop = (
        (this.settingsMenuElem.scrollHeight - this.settingsMenuElem.offsetHeight) - 
        (this.settingsMenuOnCloseScrollBottom * percentage)
      )
    }

    $.s('.ytp-ambilight-settings-button').attr('aria-expanded', true)

    const playerElem = $.s('.html5-video-player')
    if(playerElem) {
      playerElem.classList.add('ytp-ambilight-settings-shown')
    }

    this.settingsMenuBtn.off('click', this.onSettingsBtnClickedListener)
    setTimeout(() => {
      body.on('click', this.onCloseSettings, (listener) => this.onCloseSettingsListener = listener)
    }, 100)
  }

  onCloseSettings = (e) => {
    if (this.settingsMenuElem === e.target || this.settingsMenuElem.contains(e.target))
      return

    this.settingsMenuOnCloseScrollBottom = (!this.settingsMenuElem.scrollTop) 
      ? -1 : 
      (this.settingsMenuElem.scrollHeight - this.settingsMenuElem.offsetHeight) - this.settingsMenuElem.scrollTop
    this.settingsMenuOnCloseScrollHeight = (this.settingsMenuElem.scrollHeight)

    this.settingsMenuElem.on('animationend', this.onSettingsFadeOutEnd, (listener) => this.onSettingsFadeOutEndListener = listener)
    this.settingsMenuElem.class('fade-out')

    $.s('.ytp-ambilight-settings-button').attr('aria-expanded', false)

    const playerElem = $.s('.html5-video-player')
    if(playerElem) {
      playerElem.classList.remove('ytp-ambilight-settings-shown')
    }

    body.off('click', this.onCloseSettingsListener)
    setTimeout(() => {
      this.settingsMenuBtn.on('click', this.onSettingsBtnClicked, (listener) => this.onSettingsBtnClickedListener = listener)
    }, 100)
  }

  onSettingsFadeOutEnd = () => {
    this.settingsMenuElem.removeClass('fade-out').removeClass('is-visible')
    this.settingsMenuElem.off('animationend', this.onSettingsFadeOutEndListener)
  }

  setSetting(key, value) {
    this[key] = value

    if (key === 'blur')
      value -= 30
    if (key === 'bloom')
      value -= 7

    if (!this.setSettingTimeout)
      this.setSettingTimeout = {}

    if (this.setSettingTimeout[key])
      clearTimeout(this.setSettingTimeout[key])

    this.setSettingTimeout[key] = setTimeout(() => {
      try {
        localStorage.setItem(`ambilight-${key}`, value)
      } catch (ex) {
        console.warn('YouTube Ambilight | setSetting', ex)
        //AmbilightSentry.captureExceptionWithDetails(ex)
      }
      this.setSettingTimeout[key] = null
    }, 500)
  }

  getSetting(key) {
    let value = null
    try {
      value = localStorage.getItem(`ambilight-${key}`)
    } catch (ex) {
      console.warn('YouTube Ambilight | getSetting', ex)
      //AmbilightSentry.captureExceptionWithDetails(ex)
    }
    const setting = this.settings.find(setting => setting.name === key) || {}
    if (value === null) {
      value = setting.default
    } else if (setting.type === 'checkbox' || setting.type === 'section') {
      value = (value === 'true')
    } else {
      if (key === 'blur')
        value = parseInt(value) + 30
      if (key === 'bloom')
        value = parseInt(value) + 7
    }

    return value
  }

  removeSetting(key) {
    try {
      localStorage.removeItem(`ambilight-${key}`)
    } catch (ex) {
      console.warn('YouTube Ambilight | removeSetting', ex)
      //AmbilightSentry.captureExceptionWithDetails(ex)
    }
  }
}