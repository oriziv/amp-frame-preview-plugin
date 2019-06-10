/**
 * AMP frame preview plugin
 * Copyright (c) 2019 Microsoft
 * @author Nofar Edan
 * @desc Plugin for timeline rendering of a video keyframe image sprite,
 *       based on SpriteTip plugin by Rick Shahid.
 * @link https://www.videoindexer.com
 *
 *
 * FramePreviewPlugin
 * @arguments
 *      options
 *      {
 *        width :number - keyframe width
 *        height :number - keyframe height
 *        top   :number - keyframe top
 *        keyframes: Keyframe[]
 *      }
 *
 * @interface Keyframe
 *       {
 *          startSeconds : number
 *          endSeconds : number
 *          url : string
 *          xPosition : number
 *          yPosition : number
 *       }
 */
function framePreviewPlugin(options) {
  const player = this;
  player.addEventListener(amp.eventName.loadeddata, function () {
    initializeSprite(player, options);
  });

  function initializeSprite(currentPlayer, currentOptions) {
    const seekBar = currentPlayer.controlBar.progressControl.seekBar.el();
    const progressBar = currentPlayer.controlBar.progressControl.el();
    const keyframesData = currentOptions.keyframes;
    seekBar.addEventListener('mousemove', function (e) {
        const timeSeconds = getTimeSeconds(e, currentPlayer);
        for (let i = 0; i < keyframesData.length; i++) {
            const currentKeyframe = keyframesData[i];
            if (currentKeyframe.startSeconds <= timeSeconds &&
                currentKeyframe.endSeconds >= timeSeconds) {
                const imgKeyframeObject = document.getElementById('imgKeyframe');
                imgKeyframeObject.style['background-image'] = `url(${currentKeyframe.url})`;
                imgKeyframeObject.style['background-position'] = `-${currentKeyframe.xPosition}px ${currentKeyframe.yPosition}px`;

                imgKeyframeObject.style.width = `${currentOptions.width}px`;
                imgKeyframeObject.style.height = `${currentOptions.height}px`;
                imgKeyframeObject.style.top = `${currentOptions.top}px`;

                imgKeyframeObject.style['background-color'] = 'black';
                imgKeyframeObject.style['background-repeat'] = 'no-repeat';
                imgKeyframeObject.style['background-size'] = 'cover';
                imgKeyframeObject.style.visibility = 'visible';
                imgKeyframeObject.style.opacity = '1';
            }
        }
    });

    progressBar.addEventListener('mouseout', function (event) {
        const imgKeyframeObject = document.getElementById('imgKeyframe');
        const relatedTarget = event.relatedTarget;

        if (relatedTarget !== null) {
          // First, check if focus is still on seek bar
          if (relatedTarget === seekBar) {
            imgKeyframeObject.style.visibility = 'visible';
            imgKeyframeObject.style.opacity = '1';

            return;
          }

          // Check if mouse moved it's focus to child element
          const parents = getParents(relatedTarget);
          // if mouse moved to a child of seek bar
          if (( parents.indexOf(seekBar) !== -1 ) ) {
            imgKeyframeObject.style.visibility = 'visible';
            imgKeyframeObject.style.opacity = '1';

            return;
          }
        }
        imgKeyframeObject.style.visibility = 'hidden';
        imgKeyframeObject.style.opacity = '0';
      });

      // Append image
      const imgKeyframe = document.createElement('img');
      imgKeyframe.id = 'imgKeyframe';
      imgKeyframe.style.position = 'absolute';
      seekBar.appendChild(imgKeyframe);

      // Append padding div
      const paddingDiv = document.createElement('div');
      paddingDiv.style.position = 'absolute';
      paddingDiv.style.width = '100%';
      paddingDiv.style.height = '16px';
      paddingDiv.style.bottom = '-2px';
      seekBar.appendChild(paddingDiv);
    }

    function getParents(node: any): any[] {
      let aNode = node.parentNode;
       const parents = [];
       while (aNode) {
         parents.push(aNode);
         aNode = aNode.parentNode;
       }

       return parents;
    }

    function getTimeSeconds(e, currentPlayer) {
        const seekBar = currentPlayer.controlBar.progressControl.seekBar;
        const seekLeft = seekBar.el().getBoundingClientRect().left;
        const seekWidth = seekBar.width();
        const mouseOffset = (e.pageX - seekLeft) / seekWidth;
        const playerDuration = currentPlayer.pl ? currentPlayer.pl.totalTime : currentPlayer.duration();
        const timeSeconds = playerDuration * mouseOffset;
        setImageLeft(seekWidth, mouseOffset);
        return timeSeconds;
    }

    function setImageLeft(seekWidth, mouseOffset) {
        const imgKeyframeObject = document.getElementById('imgKeyframe');
        let imgLeft = (seekWidth * mouseOffset) - (imgKeyframeObject['width'] / 2);
        if (imgLeft < 0) {
            imgLeft = 0;
        } else if (imgLeft + imgKeyframeObject['width'] > seekWidth) {
            imgLeft = seekWidth - imgKeyframeObject['width'];
        }
        imgKeyframeObject.style.left = imgLeft + 'px';
    }
}

export function createFramePreviewPlugin() {
  if (!('amp' in window)) {
    throw new Error('Azure Media Player not found!');
  }

  // Register Plugin on AMP
  window.amp.plugin('framePreview', framePreviewPlugin);
}
