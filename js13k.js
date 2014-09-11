(function() {
  var WebSocket = window.WebSocket || window.MozWebSocket;
  var br = window.brunch = (window.brunch || {});
  var ar = br['auto-reload'] = (br['auto-reload'] || {});
  if (!WebSocket || ar.disabled) return;

  var cacheBuster = function(url){
    var date = Math.round(Date.now() / 1000).toString();
    url = url.replace(/(\&|\\?)cacheBuster=\d*/, '');
    return url + (url.indexOf('?') >= 0 ? '&' : '?') +'cacheBuster=' + date;
  };

  var reloaders = {
    page: function(){
      window.location.reload(true);
    },

    stylesheet: function(){
      [].slice
        .call(document.querySelectorAll('link[rel="stylesheet"]'))
        .filter(function(link){
          return (link != null && link.href != null);
        })
        .forEach(function(link) {
          link.href = cacheBuster(link.href);
        });
    }
  };
  var port = ar.port || 9485;
  var host = br.server || window.location.hostname;

  var connect = function(){
    var connection = new WebSocket('ws://' + host + ':' + port);
    connection.onmessage = function(event){
      if (ar.disabled) return;
      var message = event.data;
      var reloader = reloaders[message] || reloaders.page;
      reloader();
    };
    connection.onerror = function(){
      if (connection.readyState) connection.close();
    };
    connection.onclose = function(){
      window.setTimeout(connect, 1000);
    };
  };
  connect();
})();

/**
 * SfxrParams
 *
 * Copyright 2010 Thomas Vian
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Thomas Vian
 */
/** @constructor */
function SfxrParams() {
  //--------------------------------------------------------------------------
  //
  //  Settings String Methods
  //
  //--------------------------------------------------------------------------

  /**
   * Parses a settings array into the parameters
   * @param array Array of the settings values, where elements 0 - 23 are
   *                a: waveType
   *                b: attackTime
   *                c: sustainTime
   *                d: sustainPunch
   *                e: decayTime
   *                f: startFrequency
   *                g: minFrequency
   *                h: slide
   *                i: deltaSlide
   *                j: vibratoDepth
   *                k: vibratoSpeed
   *                l: changeAmount
   *                m: changeSpeed
   *                n: squareDuty
   *                o: dutySweep
   *                p: repeatSpeed
   *                q: phaserOffset
   *                r: phaserSweep
   *                s: lpFilterCutoff
   *                t: lpFilterCutoffSweep
   *                u: lpFilterResonance
   *                v: hpFilterCutoff
   *                w: hpFilterCutoffSweep
   *                x: masterVolume
   * @return If the string successfully parsed
   */
  this.setSettings = function(values)
  {
    for ( var i = 0; i < 24; i++ )
    {
      this[String.fromCharCode( 97 + i )] = values[i] || 0;
    }

    // I moved this here from the reset(true) function
    if (this['c'] < .01) {
      this['c'] = .01;
    }

    var totalTime = this['b'] + this['c'] + this['e'];
    if (totalTime < .18) {
      var multiplier = .18 / totalTime;
      this['b']  *= multiplier;
      this['c'] *= multiplier;
      this['e']   *= multiplier;
    }
  }
}

/**
 * SfxrSynth
 *
 * Copyright 2010 Thomas Vian
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @author Thomas Vian
 */
/** @constructor */
function SfxrSynth() {
  // All variables are kept alive through function closures

  //--------------------------------------------------------------------------
  //
  //  Sound Parameters
  //
  //--------------------------------------------------------------------------

  this._params = new SfxrParams();  // Params instance

  //--------------------------------------------------------------------------
  //
  //  Synth Variables
  //
  //--------------------------------------------------------------------------

  var _envelopeLength0, // Length of the attack stage
      _envelopeLength1, // Length of the sustain stage
      _envelopeLength2, // Length of the decay stage

      _period,          // Period of the wave
      _maxPeriod,       // Maximum period before sound stops (from minFrequency)

      _slide,           // Note slide
      _deltaSlide,      // Change in slide

      _changeAmount,    // Amount to change the note by
      _changeTime,      // Counter for the note change
      _changeLimit,     // Once the time reaches this limit, the note changes

      _squareDuty,      // Offset of center switching point in the square wave
      _dutySweep;       // Amount to change the duty by

  //--------------------------------------------------------------------------
  //
  //  Synth Methods
  //
  //--------------------------------------------------------------------------

  /**
   * Resets the runing variables from the params
   * Used once at the start (total reset) and for the repeat effect (partial reset)
   */
  this.reset = function() {
    // Shorter reference
    var p = this._params;

    _period       = 100 / (p['f'] * p['f'] + .001);
    _maxPeriod    = 100 / (p['g']   * p['g']   + .001);

    _slide        = 1 - p['h'] * p['h'] * p['h'] * .01;
    _deltaSlide   = -p['i'] * p['i'] * p['i'] * .000001;

    if (!p['a']) {
      _squareDuty = .5 - p['n'] / 2;
      _dutySweep  = -p['o'] * .00005;
    }

    _changeAmount =  1 + p['l'] * p['l'] * (p['l'] > 0 ? -.9 : 10);
    _changeTime   = 0;
    _changeLimit  = p['m'] == 1 ? 0 : (1 - p['m']) * (1 - p['m']) * 20000 + 32;
  }

  // I split the reset() function into two functions for better readability
  this.totalReset = function() {
    this.reset();

    // Shorter reference
    var p = this._params;

    // Calculating the length is all that remained here, everything else moved somewhere
    _envelopeLength0 = p['b']  * p['b']  * 100000;
    _envelopeLength1 = p['c'] * p['c'] * 100000;
    _envelopeLength2 = p['e']   * p['e']   * 100000 + 12;
    // Full length of the volume envelop (and therefore sound)
    // Make sure the length can be divided by 3 so we will not need the padding "==" after base64 encode
    return ((_envelopeLength0 + _envelopeLength1 + _envelopeLength2) / 3 | 0) * 3;
  }

  /**
   * Writes the wave to the supplied buffer ByteArray
   * @param buffer A ByteArray to write the wave to
   * @return If the wave is finished
   */
  this.synthWave = function(buffer, length) {
    // Shorter reference
    var p = this._params;

    // If the filters are active
    var _filters = p['s'] != 1 || p['v'],
        // Cutoff multiplier which adjusts the amount the wave position can move
        _hpFilterCutoff = p['v'] * p['v'] * .1,
        // Speed of the high-pass cutoff multiplier
        _hpFilterDeltaCutoff = 1 + p['w'] * .0003,
        // Cutoff multiplier which adjusts the amount the wave position can move
        _lpFilterCutoff = p['s'] * p['s'] * p['s'] * .1,
        // Speed of the low-pass cutoff multiplier
        _lpFilterDeltaCutoff = 1 + p['t'] * .0001,
        // If the low pass filter is active
        _lpFilterOn = p['s'] != 1,
        // masterVolume * masterVolume (for quick calculations)
        _masterVolume = p['x'] * p['x'],
        // Minimum frequency before stopping
        _minFreqency = p['g'],
        // If the phaser is active
        _phaser = p['q'] || p['r'],
        // Change in phase offset
        _phaserDeltaOffset = p['r'] * p['r'] * p['r'] * .2,
        // Phase offset for phaser effect
        _phaserOffset = p['q'] * p['q'] * (p['q'] < 0 ? -1020 : 1020),
        // Once the time reaches this limit, some of the    iables are reset
        _repeatLimit = p['p'] ? ((1 - p['p']) * (1 - p['p']) * 20000 | 0) + 32 : 0,
        // The punch factor (louder at begining of sustain)
        _sustainPunch = p['d'],
        // Amount to change the period of the wave by at the peak of the vibrato wave
        _vibratoAmplitude = p['j'] / 2,
        // Speed at which the vibrato phase moves
        _vibratoSpeed = p['k'] * p['k'] * .01,
        // The type of wave to generate
        _waveType = p['a'];

    var _envelopeLength      = _envelopeLength0,     // Length of the current envelope stage
        _envelopeOverLength0 = 1 / _envelopeLength0, // (for quick calculations)
        _envelopeOverLength1 = 1 / _envelopeLength1, // (for quick calculations)
        _envelopeOverLength2 = 1 / _envelopeLength2; // (for quick calculations)

    // Damping muliplier which restricts how fast the wave position can move
    var _lpFilterDamping = 5 / (1 + p['u'] * p['u'] * 20) * (.01 + _lpFilterCutoff);
    if (_lpFilterDamping > .8) {
      _lpFilterDamping = .8;
    }
    _lpFilterDamping = 1 - _lpFilterDamping;

    var _finished = false,     // If the sound has finished
        _envelopeStage    = 0, // Current stage of the envelope (attack, sustain, decay, end)
        _envelopeTime     = 0, // Current time through current enelope stage
        _envelopeVolume   = 0, // Current volume of the envelope
        _hpFilterPos      = 0, // Adjusted wave position after high-pass filter
        _lpFilterDeltaPos = 0, // Change in low-pass wave position, as allowed by the cutoff and damping
        _lpFilterOldPos,       // Previous low-pass wave position
        _lpFilterPos      = 0, // Adjusted wave position after low-pass filter
        _periodTemp,           // Period modified by vibrato
        _phase            = 0, // Phase through the wave
        _phaserInt,            // Integer phaser offset, for bit maths
        _phaserPos        = 0, // Position through the phaser buffer
        _pos,                  // Phase expresed as a Number from 0-1, used for fast sin approx
        _repeatTime       = 0, // Counter for the repeats
        _sample,               // Sub-sample calculated 8 times per actual sample, averaged out to get the super sample
        _superSample,          // Actual sample writen to the wave
        _vibratoPhase     = 0; // Phase through the vibrato sine wave

    // Buffer of wave values used to create the out of phase second wave
    var _phaserBuffer = new Array(1024),
        // Buffer of random values used to generate noise
        _noiseBuffer  = new Array(32);
    for (var i = _phaserBuffer.length; i--; ) {
      _phaserBuffer[i] = 0;
    }
    for (var i = _noiseBuffer.length; i--; ) {
      _noiseBuffer[i] = Math.random() * 2 - 1;
    }

    for (var i = 0; i < length; i++) {
      if (_finished) {
        return i;
      }

      // Repeats every _repeatLimit times, partially resetting the sound parameters
      if (_repeatLimit) {
        if (++_repeatTime >= _repeatLimit) {
          _repeatTime = 0;
          this.reset();
        }
      }

      // If _changeLimit is reached, shifts the pitch
      if (_changeLimit) {
        if (++_changeTime >= _changeLimit) {
          _changeLimit = 0;
          _period *= _changeAmount;
        }
      }

      // Acccelerate and apply slide
      _slide += _deltaSlide;
      _period *= _slide;

      // Checks for frequency getting too low, and stops the sound if a minFrequency was set
      if (_period > _maxPeriod) {
        _period = _maxPeriod;
        if (_minFreqency > 0) {
          _finished = true;
        }
      }

      _periodTemp = _period;

      // Applies the vibrato effect
      if (_vibratoAmplitude > 0) {
        _vibratoPhase += _vibratoSpeed;
        _periodTemp *= 1 + Math.sin(_vibratoPhase) * _vibratoAmplitude;
      }

      _periodTemp |= 0;
      if (_periodTemp < 8) {
        _periodTemp = 8;
      }

      // Sweeps the square duty
      if (!_waveType) {
        _squareDuty += _dutySweep;
        if (_squareDuty < 0) {
          _squareDuty = 0;
        } else if (_squareDuty > .5) {
          _squareDuty = .5;
        }
      }

      // Moves through the different stages of the volume envelope
      if (++_envelopeTime > _envelopeLength) {
        _envelopeTime = 0;

        switch (++_envelopeStage)  {
          case 1:
            _envelopeLength = _envelopeLength1;
            break;
          case 2:
            _envelopeLength = _envelopeLength2;
        }
      }

      // Sets the volume based on the position in the envelope
      switch (_envelopeStage) {
        case 0:
          _envelopeVolume = _envelopeTime * _envelopeOverLength0;
          break;
        case 1:
          _envelopeVolume = 1 + (1 - _envelopeTime * _envelopeOverLength1) * 2 * _sustainPunch;
          break;
        case 2:
          _envelopeVolume = 1 - _envelopeTime * _envelopeOverLength2;
          break;
        case 3:
          _envelopeVolume = 0;
          _finished = true;
      }

      // Moves the phaser offset
      if (_phaser) {
        _phaserOffset += _phaserDeltaOffset;
        _phaserInt = _phaserOffset | 0;
        if (_phaserInt < 0) {
          _phaserInt = -_phaserInt;
        } else if (_phaserInt > 1023) {
          _phaserInt = 1023;
        }
      }

      // Moves the high-pass filter cutoff
      if (_filters && _hpFilterDeltaCutoff) {
        _hpFilterCutoff *= _hpFilterDeltaCutoff;
        if (_hpFilterCutoff < .00001) {
          _hpFilterCutoff = .00001;
        } else if (_hpFilterCutoff > .1) {
          _hpFilterCutoff = .1;
        }
      }

      _superSample = 0;
      for (var j = 8; j--; ) {
        // Cycles through the period
        _phase++;
        if (_phase >= _periodTemp) {
          _phase %= _periodTemp;

          // Generates new random noise for this period
          if (_waveType == 3) {
            for (var n = _noiseBuffer.length; n--; ) {
              _noiseBuffer[n] = Math.random() * 2 - 1;
            }
          }
        }

        // Gets the sample from the oscillator
        switch (_waveType) {
          case 0: // Square wave
            _sample = ((_phase / _periodTemp) < _squareDuty) ? .5 : -.5;
            break;
          case 1: // Saw wave
            _sample = 1 - _phase / _periodTemp * 2;
            break;
          case 2: // Sine wave (fast and accurate approx)
            _pos = _phase / _periodTemp;
            _pos = (_pos > .5 ? _pos - 1 : _pos) * 6.28318531;
            _sample = 1.27323954 * _pos + .405284735 * _pos * _pos * (_pos < 0 ? 1 : -1);
            _sample = .225 * ((_sample < 0 ? -1 : 1) * _sample * _sample  - _sample) + _sample;
            break;
          case 3: // Noise
            _sample = _noiseBuffer[Math.abs(_phase * 32 / _periodTemp | 0)];
        }

        // Applies the low and high pass filters
        if (_filters) {
          _lpFilterOldPos = _lpFilterPos;
          _lpFilterCutoff *= _lpFilterDeltaCutoff;
          if (_lpFilterCutoff < 0) {
            _lpFilterCutoff = 0;
          } else if (_lpFilterCutoff > .1) {
            _lpFilterCutoff = .1;
          }

          if (_lpFilterOn) {
            _lpFilterDeltaPos += (_sample - _lpFilterPos) * _lpFilterCutoff;
            _lpFilterDeltaPos *= _lpFilterDamping;
          } else {
            _lpFilterPos = _sample;
            _lpFilterDeltaPos = 0;
          }

          _lpFilterPos += _lpFilterDeltaPos;

          _hpFilterPos += _lpFilterPos - _lpFilterOldPos;
          _hpFilterPos *= 1 - _hpFilterCutoff;
          _sample = _hpFilterPos;
        }

        // Applies the phaser effect
        if (_phaser) {
          _phaserBuffer[_phaserPos % 1024] = _sample;
          _sample += _phaserBuffer[(_phaserPos - _phaserInt + 1024) % 1024];
          _phaserPos++;
        }

        _superSample += _sample;
      }

      // Averages out the super samples and applies volumes
      _superSample *= .125 * _envelopeVolume * _masterVolume;

      // Clipping if too loud
      buffer[i] = _superSample >= 1 ? 32767 : _superSample <= -1 ? -32768 : _superSample * 32767 | 0;
    }

    return length;
  }
}

// Adapted from http://codebase.es/riffwave/
var synth = new SfxrSynth();
// Export for the Closure Compiler
window['jsfxr'] = function(settings) {
  // Initialize SfxrParams
  synth._params.setSettings(settings);
  // Synthesize Wave
  var envelopeFullLength = synth.totalReset();
  var data = new Uint8Array(((envelopeFullLength + 1) / 2 | 0) * 4 + 44);
  var used = synth.synthWave(new Uint16Array(data.buffer, 44), envelopeFullLength) * 2;
  var dv = new Uint32Array(data.buffer, 0, 44);
  // Initialize header
  dv[0] = 0x46464952; // "RIFF"
  dv[1] = used + 36;  // put total size here
  dv[2] = 0x45564157; // "WAVE"
  dv[3] = 0x20746D66; // "fmt "
  dv[4] = 0x00000010; // size of the following
  dv[5] = 0x00010001; // Mono: 1 channel, PCM format
  dv[6] = 0x0000AC44; // 44,100 samples per second
  dv[7] = 0x00015888; // byte rate: two bytes per sample
  dv[8] = 0x00100002; // 16 bits per sample, aligned on every two bytes
  dv[9] = 0x61746164; // "data"
  dv[10] = used;      // put number of samples here

  // Base64 encoding written by me, @maettig
  used += 44;
  var i = 0,
      base64Characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
      output = 'data:audio/wav;base64,';
  for (; i < used; i += 3)
  {
    var a = data[i] << 16 | data[i + 1] << 8 | data[i + 2];
    output += base64Characters[a >> 18] + base64Characters[a >> 12 & 63] + base64Characters[a >> 6 & 63] + base64Characters[a & 63];
  }
  return output;
}
;(function(){
	// Helper method to draw a shape from an array of points
	window.drawShape = function(ctx, points, tx, mirror, stroke, fill){
		ctx.beginPath();
		ctx.moveTo(tx.x+points[0][0], tx.y+points[0][1]);
		
		// Draw the path
		var numPoints = points.length;
		var i;
		for(i=1; i<numPoints; ++i){
			ctx.lineTo(tx.x+points[i][0], tx.y+points[i][1]);
		}
		
		// If mirror is true then run through the points again and draw a
		// mirrored version
		if(mirror == true){
			for(i=numPoints-1; i>-1; --i){
				ctx.lineTo(tx.x+(-points[i][0]), tx.y+points[i][1]);
			}
		}
		
		// Apply line styles
		if(fill == true) ctx.fill();
		if(stroke == true) ctx.stroke();
	}
	
	// Helper function for drawing circles
	window.drawCircle = function(ctx, x, y, r, stroke, fill){
		ctx.beginPath();
		ctx.arc(x, y, r, 0, 2*Math.PI);
		
		if(fill == true) ctx.fill();
		if(stroke !== false) ctx.stroke();
	}
	
	// Helper function for drawing arcs
	window.drawArc = function(ctx, x, y, rotation, start, end){
		ctx.beginPath();
		ctx.arc(x, y, rotation, start, end);
		ctx.stroke();
	}
	
	// Helper function to draw a grid in a bounding box
	window.drawGrid = function(ctx, options){
		var bounds = options.bounds;
		var step = options.step;
		var offset = options.offset;
		var verticalSteps = Math.floor(bounds.bottom / step);
		
		ctx.lineWidth = 1;
		ctx.strokeStyle = 'rgba(80, 80, 80, 1)';
		ctx.beginPath();
		
		var y;
		for(var i=0; i<verticalSteps; ++i){
			y = i*step + offset;
			ctx.moveTo(bounds.left, y);
			ctx.lineTo(bounds.right, y);
		}
		ctx.stroke();
	}
})();
(function(){
	Effects = function(){
		this.sounds = {};
	}
	Effects.prototype.add = function(key, count, settings){
		this.sounds[key] = [];
		settings.forEach(function(el, index){
			this.sounds[key].push({
				tick: 0,
				count: count,
				pool: []
			});
			for(var i=0; i<count; ++i){
				var audio = new Audio();
				audio.src = jsfxr(el);
				this.sounds[key][index].pool.push(audio);
			}
		}, this);
	};
	Effects.prototype.play = function(key){
		var sound = this.sounds[key];
		var soundData = sound.length > 1 ? sound[Math.floor(Math.random()*sound.length)] : sound[0];
		soundData.pool[soundData.tick].play();
		soundData.tick < soundData.count-1 ? soundData.tick++ : soundData.tick = 0;
	};
	window.Effects = new Effects();
})();
(function(){
	window.FrameTimer = function(options){
		var self = this;
		
		self._frames = [];
		self._graph = [];
		self._fps = 0;
		self.bounds = options.bounds;
		
		// History array of delta values passed into update()
		self._deltaHistory = [];
		
		// History array ms between calls to draw()
		self._drawHistory = [];
		self._lastDraw = 0;
		
		// Calculates FPS by sampling previous frames. Keep trask of the last 30
		// frameTime values, when we have 30 we take the average and use it to
		// calculate the frame rate.
		self.update = function(frameTime, delta){
			self._deltaHistory.push(delta);
			if(self._deltaHistory.length > self.bounds.right) self._deltaHistory.shift();
		}
		
		self.draw = function(ctx){
			
			// Work out and store how long it's been since the last draw
			var now = performance.now();
			var ms = now - self._lastDraw;
			self._drawHistory.push(ms);
			if(self._drawHistory.length > self.bounds.right) self._drawHistory.shift();
			self._lastDraw = now;
			
			// Draw the two graphs the full width of the bounds
			self.drawGraph(ctx, self._drawHistory, 'rgba(255, 0, 0, 0.5)');
			self.drawGraph(ctx, self._deltaHistory, 'rgba(0, 255, 0, 0.5)');
		}
		
		self.drawGraph = function(ctx, graph, color){
			var points = [];
			for(var i=0; i<graph.length; ++i){
				points.push([i, 50-graph[i]]);
			}
			ctx.strokeStyle = color;
			if(points.length){
				drawShape(ctx, points, {x: self.bounds.right-graph.length, y: 0}, false, true);
			}
		}
	}
})();
(function(){
	
	var TARGET_DELTA = 60/1000;
	
	// A collection for managing assets in the game loop.
	var AssetList = function(){
		var self = this;
		
		self._assets = [];
		
		// Add an asset
		self.add = function(asset){
			asset.assetList = self;
			self._assets.push(asset);
			return asset;
		}
		
		// Remove an asset
		self.remove = function(asset){
			var i = self._assets.indexOf(asset);
			if(i > -1)
				self._assets.splice(i, 1);
			return asset;
		}
		
		// Update all assets
		self.update = function(frameTime, delta){
			self._assets.forEach(function(asset){
				if(asset.update)
					asset.update(frameTime, delta);
			});
		}
		
		// Draw all assets
		self.draw = function(ctx){
			self._assets.forEach(function(asset){
				if(asset.draw)
					asset.draw(ctx);
			});
		}
	};
	
	window.GameLoop = function(options){
		var self = this;
		
		// Extend this with options passed in
		extend(self, options);
		
		self.ctx = self.canvas.getContext('2d');
		self.width = self.canvas.width;
		self.height = self.canvas.height;
		
		self._running = false;
		
		self._lastUpdate = 0;
		
		// Start the game loop
		// Initialize the game and queue an update to start the loop
		self.start = function(){
			self.assets = new AssetList();
			self.initialize(self.assets);
			
			// Only queue an update if there isn't already one
			if(!self._running){
				self._running = true;
				self._queueUpdate();
			}
		}
		
		// Queue an update
		self._queueUpdate = function(){
			setTimeout(self._update, 0);
		}
		
		// Queue a draw
		self._queueDraw = function(){
			window.requestAnimationFrame(self._draw);
		}
		
		// Update game logic
		self._update = function(){
			
			var now = performance.now();
			var frameTime = now - self._lastUpdate;
			var delta = TARGET_DELTA * frameTime;
			self._lastUpdate = now;
			
			// Update each game asset and the passed in callback
			self.assets.update(frameTime, delta);
			self.update(frameTime, delta);
			
			//TODO: Clear pressed keys from the input manager
			
			// Queue the next draw
			self._queueDraw();
		}
		
		// Draw a frame
		self._draw = function(now){
			
			// Draw each game asset and update the passed in callback
			self.assets.draw(self.ctx);
			self.draw();
			
			// Queue the next update
			self._queueUpdate();
		}
	}
})();
(function(){
	
	// DOM selector method
	window.$ = function(selector)
	{
		if(selector.charAt(0) == '#')
			return document.getElementById(selector.substr(1, selector.length));
	}
	
	// Check if one rectangle intersects another
	window.intersectRect = function(r1, r2) {
		return !(r2.left > r1.right || 
			r2.right < r1.left || 
			r2.top > r1.bottom ||
			r2.bottom < r1.top);
	}
	
	// Extend objects with properties of another
	window.extend = function(){
		var args = arguments;
		var a = args[0] || {};
		for(var i=1; i<args.length; ++i){
			var b = args[i];
			for(var key in b){
				a[key] = b[key];
			}
		}
		return a;
	}
})();
// A simple global input manager class to manage game controls.
// Keeps a map of all keys that are currently pressed so it
// can be queried to check a game control without individual
// assets having to listen to DOM events.
// 
// Example:
// 
// 	if(Input.up()){
//		// move somewhere...
// 	}
(function(){
	
	var _keys = {};
	var _mouseX = 0;
	var _mouseY = 0;
	
	// Listen to keydown and keyup events to keep a map of all
	// currently pressed keys
	document.addEventListener('keydown', function(e){
		_keys[e.keyCode] = true;
	});
	
	//NOTE: There is a problem here, it's possible for a key to be pressed
	// and released between two frames meaning that the keypress would not
	// be registered.
	document.addEventListener('keyup', function(e){
		delete _keys[e.keyCode];
	});
	
	// Listen to for mousedown event and keep a map of it like we down with
	// keydown events.
	document.addEventListener('mousedown', function(e){
		_keys['leftmouse'] = true;
	});
	document.addEventListener('mouseup', function(e){
		delete _keys['leftmouse'];
	});
	
	// Listen to mousemove, storing the coordinates as we are ready to return
	// them from Input.mouse() method whenever it is called.
	document.addEventListener('mousemove', function(e){
		_mouseX = e.clientX;
		_mouseY = e.clientY;
	});
	
	// Check if a control is currently down or not
	_isDown = function(keys){
		for(var i=0; i<keys.length; ++i){
			if(_keys[keys[i]] == true){
				return true;
			}
		}
		return false;
	}
	
	window.Input = {
		
		// w, up arrow
		up: function(){
			return _isDown([38, 87]);
		},
		
		// d, right arrow
		right: function(){
			return _isDown([39, 68]);
		},
		
		// s, down arrow
		down: function(){
			return _isDown([40, 83]);
		},
		
		// a, left arrow
		left: function(){
			return _isDown([37, 65]);
		},
		
		// space bar, left mouse
		fire: function(){
			return _isDown([32, 'leftmouse']);
		},
		
		// enter
		restart: function(){
			return _isDown([13]);
		},
		
		// mouse position
		mouse: function(){
			return {x: _mouseX, y: _mouseY};
		}
	};
})();

(function(){
	window.Background = function(options){
		var self = this;
		
		options = options || {};
		self.width = options.width || 400;
		self.height = options.height || 400;
		
		self.offset = 0;
		
		self.update = function(frameTime, delta){
			self.offset += delta;
			if(self.offset > 50)
				self.offset -= 50;
		}
		
		// Draw the background rect
		self.draw = function(ctx){
			var width = self.width;
			var height = self.height;
			
			ctx.fillStyle = '#000';
			ctx.fillRect(0, 0, width, height);
			
			// Draw a grid on the bg
			drawGrid(ctx, {
				bounds: {
					top: 0,
					right: width,
					bottom: height,
					left: 0
				},
				step: 50,
				offset: self.offset
			});
		}
	}
})();
(function(){
	window.Bullet = function(options){
		window.Bullet.instances.push(this);
		
		var self = this;
		
		self.x = options.x;
		self.y = options.y;
		self.speedVariation = options.speedVariation || 0;
		self.angleVariation = options.angleVariation || 0;
		self.bounds = options.bounds;
		
		// Add the angle variation
		var angleAdjust = (Math.random() * self.angleVariation) - (self.angleVariation / 2);
		var angle = self.angle = options.angle + angleAdjust;
		
		// Apply the speed variation
		var speedAdjust = (Math.random() * self.speedVariation) - (self.speedVariation / 2);
		self.speed = (options.speed || 10) + speedAdjust;
		
		// Calculate the cos and sin values once up front based on the
		// initial angle. The angle wont change here once created so no
		// need to re-calculate each update.
		self._cos = Math.cos(angle);
		self._sin = -Math.sin(angle);
		
		self.update = function(frameTime, delta){
			self.speed -= (0.05 * delta);
			var speed = self.speed * delta;
			var bounds = self.bounds;
			
			// Update origin based on the angle
			var x = self.x += speed * self._cos;
			var y = self.y += speed * self._sin;
			
			// Remove if we have traveled out of bounds
			if(x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom){
				self.destroy({explode: true});
			}
		}
		
		self.draw = function(ctx){
			var x = self.x;
			var y = self.y;
			
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
			ctx.beginPath();
			ctx.moveTo((x + 20 * self._cos), (y + 20 * self._sin));
			ctx.lineTo(x, y);
			ctx.stroke();
		}
		
		self.destroy = function(options){
			window.Bullet.instances.splice(window.Bullet.instances.indexOf(self), 1);
			self.assetList.remove(self);
			
			// Particle explosion that bounces off the screen
			if(options && options.explode){
				for(var i=0; i<5; ++i){
					self.assetList.add(new Particle({
						x: self.x,
						y: self.y,
						speed: self.speed,
						speedVariation: 2.5,
						angle: self.angle,
						angleVariation: 2,
						bounds: self.bounds
						,life: 500
					}));
				}
			}
		}
		
		self.hits = function(target){
			var enemy = target.getRect();
			var x = self.x;
			var y = self.y;
			
			if(x > enemy.left && x < enemy.right && y > enemy.top && y < enemy.bottom){
				return true;
			}else{
				return false;
			}
		}
	}
	
	window.Bullet.instances = [];
})();
(function(){
	window.Enemy = function(options){
		window.Enemy.instances.push(this);
		
		var self = this;
		
		self.x = options.x;
		self.y = options.y;
		self.bounds = options.bounds;
		self.speed = options.speed || 2;
		self.escaped = options.escaped;
		self.health = options.health || 1;
		
		self.update = function(frameTime, delta){
			var bounds = self.bounds;
			var y = self.y += (self.speed * delta);
			
			// If we have traveled out of bounds then call the escaped callback
			// and remove to remove from the game loop and clean up references.
			if(y < bounds.top || y > bounds.bottom){
				if(self.escaped) self.escaped();
				self.health = 0;
				self.destroy();
			}
		}
		
		self.draw = function(ctx){
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
			
			// Draw another layer/circle for each health point
			for(var i=0; i<self.health; ++i){
				drawCircle(ctx, self.x, self.y, 10+(i*5));
			}
		}
		
		// Rect is based on health - the more health layers we have
		// the bigger the hit area.
		self.getRect = function(){
			var radius = 10 + (5 * self.health);
			return {
				top: self.y - radius,
				right: self.x + radius,
				bottom: self.y + radius,
				left: self.x - radius 
			}
		}
		
		// Apply damage to the enemy. Returns true if the enemy
		// was killed in the process, false if not.
		self.damage = function(options){
			
			// Remove damage from our health
			self.health -= options.damage;
			
			// Trigger ane explosion
			self.explode(options);
			
			// Destroy and return true if we were destroyed by the
			// damage.
			if(self.health <= 0){
				self.destroy();
				return true;
			}
			
			// If we get this far then retrn false as we're still
			// alive
			return false;
		}
		
		// Fire an explosion from the enemy
		self.explode = function(options){
			if(options.angleVariation === undefined)
				options.angleVariation = 2;
			for(var i=0; i<10; ++i){
				self.assetList.add(new Particle({
					x: options.x,
					y: options.y,
					speed: options.speed,
					speedVariation: 2.5,
					angle: options.angle,
					angleVariation: options.angleVariation,
					bounds: self.bounds
					,life: 500
				}));
			}
		}
		
		self.destroy = function(){
			
			// Draw an explosion for each point of health - more
			// health = more particles. If we've been damaged down
			// to zero from bullets then health will be zero already.
			for(var i=0; i<self.health; ++i){
				self.explode({
					x: self.x,
					y: self.y,
					speed: 5,
					angle: 0,
					angleVariation: 6.28
				});
			}
			
			// Remove from the Enemy instances array and from the
			// asset list
			window.Enemy.instances.splice(window.Enemy.instances.indexOf(self), 1);
			self.assetList.remove(self);
			
			for(var k in self){
				delete self[k];
			}
		}
	}
	window.Enemy.instances = [];
})();
(function(){
	window.GameOver = function(options){
		var self = this;
		
		self.bounds = options.bounds;
		self.scoreModel = options.scoreModel;
		self.x = self.bounds.right/2;
		self.y = self.bounds.bottom/2-30;
		
		self._framesPassed = 0;
		self.position = 0;
		
		self.update = function(frameTime, delta){
			if(self.position < 1){
				self._framesPassed += frameTime;
				self.position = Math.min(1, (1/500)*self._framesPassed);
				self.y = (self.bounds.bottom/2-30) - (50 - (self.position*50));
			}
		}
		
		self.draw = function(ctx){
			var x = self.x;
			var y = self.y;
			var opacity = self.position;
			
			ctx.fillStyle = 'rgba(255, 255, 255, '+opacity+')';
			ctx.textAlign = 'center';
			ctx.font = '36px Arial';
			ctx.fillText('Game Over', x, y);
			
			ctx.font = '18px Arial';
			ctx.fillText('Score: '+self.scoreModel.score(), x, y+30);
			
			ctx.font = '18px Arial';
			ctx.fillText("Press 'Enter' to try again", x, y+60);
		}
	};
})();
(function(){
	
	// Reflection helper methods
	var reflectVertical = function(incidence){
		var r = 0 - (incidence + Math.PI - 0);
		return -Math.PI - incidence;
	}
	var reflectHorizontal = function(incidence){
		var r = 0.5*Math.PI - (incidence + Math.PI - 0.5*Math.PI);
		r = 2 * Math.PI - incidence;
		return -incidence;
	}
	
	window.Particle = function(options){
		window.Particle.instances.push(this);
		
		var self = this;
		
		self.x = options.x;
		self.y = options.y;
		self.speedVariation = options.speedVariation || 0;
		self.angleVariation = options.angleVariation || 0;
		self.lifeVariation = options.lifeVariation || 200;
		self.bounds = options.bounds;
		
		// Allow the colour to be passed in, but default to white
		var color = self.color = options.color || [255, 255, 255];
		self._colorString = color[0]+', '+color[1]+', '+color[2];
		
		self.particleLength = options.particleLength || 10;
		
		// Apply the speed variation
		var speedAdjust = (Math.random() * self.speedVariation) - (self.speedVariation / 2);
		self.speed = (options.speed || 10) + speedAdjust;
		
		// Apply life variatino
		var lifeAdjust = (Math.random() * self.lifeVariation) - (self.lifeVariation / 2);
		self.life = (options.life || 300) + lifeAdjust;
		
		// Add the angle variation
		var angleAdjust = (Math.random() * self.angleVariation) - (self.angleVariation / 2);
		var angle = options.angle + angleAdjust;
		// Calculate the cos and sin values once up front based on the
		// initial angle. The angle wont change here once created so no
		// need to re-calculate each update.
		var setAngle = function(angle){
			self.angle = angle;
			self._cos = Math.cos(angle);
			self._sin = -Math.sin(angle);
		}
		setAngle(angle);
		
		self._age = 0;
		
		self.update = function(frameTime, delta){
			self.speed -= (0.05 * delta);
			var speed = self.speed * delta;
			var bounds = self.bounds;
			var x, y;
			
			// Update origin based on the angle
			var calculateCoordinates = function(){
				x = self.x + speed * self._cos;
				y = self.y + speed * self._sin;
			}
			calculateCoordinates();
			
			// Handle vertical reflection when we go out of bounds
			if(x < bounds.left || x > bounds.right){
				setAngle(reflectVertical(self.angle));
				calculateCoordinates()
			}
			
			// Handle horizontal reflection when we go out of bounds
			if(y < bounds.top || y > bounds.bottom){
				setAngle(reflectHorizontal(self.angle));
				calculateCoordinates();
			}
			
			// Store the updated positions
			self.x = x;
			self.y = y;
			
			// Remove if we've been alive too long
			self._age += frameTime;
			if(self._age > self.life)
				self.destroy();
		}
		
		self.draw = function(ctx){
			var x = self.x;
			var y = self.y;
			var opacity = 1-((1/self.life) * self._age);
			var particleLength = self.particleLength;
			
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba('+self._colorString+', '+opacity+')';
			ctx.beginPath();
			ctx.moveTo((x + particleLength * self._cos), (y + particleLength * self._sin));
			ctx.lineTo(x, y);
			ctx.stroke();
		}
		
		self.destroy = function(){
			window.Particle.instances.splice(window.Bullet.instances.indexOf(self), 1);
			self.assetList.remove(self);
		}
	}
	
	window.Particle.instances = [];
})();
(function(){
	window.ScoreBoard = function(options){
		var self = this;
		
		self.bounds = options.bounds;
		self.scoreModel = options.scoreModel;
		
		self.draw = function(ctx){
			ctx.fillStyle = '#fff';
			ctx.font = '12px Arial';
			ctx.textAlign = 'right';
			ctx.fillText(self.scoreModel.multiplier()+'x'+'   '+self.scoreModel.score(), self.bounds.right-20, 30);
		}
	}
})();
(function(){
	window.ScoreModel = function(options){
		var self = this;
		
		self._points = 0;
		self._multiplier = 1;
		self._maxMultiplier = 20;
		self._enemyChain = self._threshold = 10;
		self._totalEnemies = 0;
		
		self._difficultyLevel = 0;
		self._difficultyChain = 0;
		self.increaseDifficulty = options.increaseDifficulty;
		
		self._powerupLevel = 0;
		self._powerupChain = 0;
		self.increasePowerup = options.increasePowerup;
		
		// Get the multiplier
		self.multiplier = function(){
			return self._multiplier;
		}
		
		// Get the score
		self.score = function(){
			return self._points;
		}
		
		// Reset the miltiplier
		self.resetMultiplier = function(){
			self._multiplier = 1;
			self._enemyChain = self._threshold;
			self._powerupChain = 0;
		}
		
		// Add points to the model
		// Increase the multiplier when 100 points have been added
		self.add = function(points){
			
			self._points += (points * self._multiplier);
			
			if(self._multiplier < self._maxMultiplier && --self._enemyChain == 0){
				++self._multiplier;
				self._enemyChain = self._threshold;
			}
			
			// Increment the total enemies
			++self._totalEnemies;
			
			// When the total enemies killed gets past a
			// threshold then callback to make enemies more
			// difficult
			if(++self._difficultyChain == 10){
				self._difficultyChain = 0;
				++self._difficultyLevel;
				if(self.increaseDifficulty)
					self.increaseDifficulty(self._difficultyLevel);
			}
			
			// If the user gets a kill streak of 20 then
			// callback to award an upgrade. Powerup chain is
			// reset each time an enemy escapes but already awarded
			// powerups stay.
			if(++self._powerupChain == 20){
				self._powerupChain = 0;
				++self._powerupLevel;
				if(self.increasePowerup)
					self.increasePowerup(self._powerupLevel);
			}
		}
	}
})();
(function(){
	
	var FULL_CIRCLE = 2*Math.PI;
	var HALF_CIRCLE = FULL_CIRCLE/2;
	var QUARTER_CIRCLE = FULL_CIRCLE/4;
	var FIFTH_CIRCLE = FULL_CIRCLE/5;
	
	// Drawing positions don't change so calculate them once up front
	var INNER_ROTOR_1_POS = (QUARTER_CIRCLE * 3);
	var INNER_ROTOR_2_POS = QUARTER_CIRCLE;
	var OUTER_ROTOR_1_POS = 0;
	var OUTER_ROTOR_2_POS = HALF_CIRCLE;
	
	// http://github.grumdrig.com/jsfxr/
	// http://www.superflashbros.net/as3sfxr/
	var effects = window.Effects;
	effects.add('cannon', 5, [
		[0,,0.22,1,0.08,0.31,0.11,-0.4399,-0.76,,,-0.7,0.27,0.74,-0.3199,,,-0.0444,1,,,,,0.5],
		[0,,0.26,1,0.08,0.29,0.12,-0.4399,-0.76,,,-0.7,0.27,0.74,-0.3199,,,-0.0444,1,,,,,0.5]
	]);
	
	window.Ship = function(options){
		var self = this;
		
		options = options || {};
		self.x = options.x || 0;
		self.y = options.y || 0;
		self.bounds = options.bounds;
		
		self._rotation = 0;
		self._acceleration = 0.2;
		self._maxSpeed = 5;
		self._motion = 0;
		self._drag = 0.05;
		self._lastFired = 0;
		self._lastBurst = 0;
		self._burst = 0;
		self._bulletX = undefined;
		self._bulletY = undefined;
		
		// Cannon settings
		self.burstLength = 3;
		self.roundDelay = 90;
		self.burstDelay = (self.burstLength * self.roundDelay) + 540;
		
		// Change settings on the ship by applying options passed in
		// to the instance. Used for cannon but could do health or speed
		// etc too.
		self.powerup = function(options){
			extend(self, options);
			self.burstDelay = (self.burstLength * self.roundDelay) + 540;
		}
		
		// Health is set to 3 to start, each hit removes 1 hp
		self.health = 3;
		
		var createParticle = function(x, y){
			self.assetList.add(new Particle({
				x: x,
				y: y,
				speed: 3,
				speedVariation: 1,
				angle: 5,
				angleVariation: 1.5,
				bounds: self.bounds,
				life: 1000,
				particleLength: 7
			}));
		}
		
		self._particleTime = 0;
		
		// Update the position of the ship based on frameTime
		self.update = function(frameTime, delta){
			if(self.health > 0){
				self.updateRotor(delta);
				self.updateMovement(delta);
				self.updateCannon(delta);
				
				var lastFired = self._lastFired + frameTime;
				var lastBurst = self._lastBurst + frameTime;
				var burst = self._burst;
				
				// If the user has pressed fire then start a burst
				if(Input.fire() && burst < 1 && lastBurst > self.burstDelay){
					burst = self.burstLength;
					lastBurst = 0;
				}
				
				// If there is one or more rounds in the burst then
				// fire a new one if we have waited long enough between
				// rounds.
				if(burst > 0 && lastFired > self.roundDelay){
					self.fire();
					--burst;
					lastFired = 0;
				}
				
				// Store the values for next time
				self._lastFired = lastFired;
				self._lastBurst = lastBurst;
				self._burst = burst;
				
				// Throw some particles if we're damaged
				if(self.health < 3){
					
					self._particleTime += frameTime;
					if(self._particleTime > 100){
						self._particleTime -= 100;
						
						// Throw particles from the main roter if we're on 2 health
						var num = self.health < 2 ? 3 : 1;
						for(var i=0; i<num; ++i){
							createParticle(self.x, self.y+40);
						}
					}
				}
			}
		}
		
		self.updateCannon = function(delta){
			var mouse = Input.mouse()
			var diff = {
				x: mouse.x - self.x,
				y: mouse.y - self.y - 10
			};
			
			var theta = Math.atan2(-diff.y, diff.x);
			
			if(theta < 0)
				theta += 2 * Math.PI;
			
			cannonAngle = theta;
		}
		
		self.updateRotor = function(delta){
			var rotation = self._rotation;
			rotation -= (FULL_CIRCLE/30) * delta;
			if(rotation < -FULL_CIRCLE){
				rotation += FULL_CIRCLE;
			}
			self._rotation = rotation;
		}
		
		self.updateMovement = function(delta){
			var acceleration = self._acceleration * delta;
			var drag = self._drag * delta;
			var maxSpeed = self._maxSpeed;// * delta;
			
			var motion = self._motion;// * delta;
			var bounds = self.bounds;
			
			// Capture movement inputs
			var userInput = false;
			if(Input.right()){
				motion += acceleration;
				userInput = true;
			}
			if(Input.left()){
				motion -= acceleration;
				userInput = true;
			}
			
			// Limmit the max speed
			motion = Math.max(-maxSpeed, Math.min(maxSpeed, motion));
			
			// Apply drag if we're not actively moving
			var stoppedByDrag = false;
			if(!userInput){
				
				if(motion > drag){
					motion -= drag;
				}else if(motion < -drag){
					motion += drag;
				}else{
					motion = 0;
				}
			}
			
			// Calculate the new x position
			var newX = self.x + (motion * delta);
			
			// Adjust the bounds by 30px to stop the ship moving half off the screen
			var boundsLeft = self.bounds.left + 30;
			var boundsRight = self.bounds.right - 30;
			
			// Respect bounds
			if(newX > boundsRight){
				motion = 0;
				newX = boundsRight;
			}else if(newX < boundsLeft){
				motion = 0;
				newX = boundsLeft;
			}
			
			// Update the x position
			self.x = newX;
			
			// Store the current motion for next time
			self._motion = motion;
		}
		
		// Draw the helicopter
		self.draw = function(ctx){
			var x = self.x;
			var y = self.y;
			
			ctx.lineWidth = 1;
			ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
			ctx.fillStyle = 'rgba(0, 0, 0, 1)';
			
			self.drawCannon(ctx);
			
			// ctx.fillStyle = 'rgba(0, 0, 0, 1)'
			drawShape(ctx, [
				// Cabin
				[0, 0],
				[3, 0],
				[3, 4],
				[5, 6],
				[6, 9],
				[7, 14],
				[7, 38],
				
				// Hardpoints
				[10, 38],
				[10, 30],
				[14, 30],
				[14, 38],
				[17, 38],
				[17, 30],
				[20, 30],
				[20, 47],
				
				[12, 47],
				[12, 60],
				[6, 64],
				[6, 58],
				[3, 58],
				
				[3, 64],
				[3, 98],
				[2, 100],
				[2, 110],
				
				// Tail
				[15, 110],
				[15, 116],
				[1, 116],
				[1, 125],
				[0, 125]
			], {
				x: x,
				y: y
			}, true, true, true);
			
			self.drawRoter(ctx);
		}
		
		self.drawCannon = function(ctx){
			var x = self.x;
			var y = self.y + 10;
			var endX = self._bulletX = x + 20 * Math.cos(cannonAngle);
			var endY = self._bulletY = y + 20 * -Math.sin(cannonAngle);
			
			ctx.beginPath();
			ctx.moveTo(endX, endY);
			ctx.lineTo(x, y);
			ctx.stroke();
		}
		
		self.drawRoter = function(ctx){
			var x = self.x;
			var y = self.y+40;
			var rotation = self._rotation;
			
			// Apply the rotation value to the rotor line positions
			var innerRotor1Pos = INNER_ROTOR_1_POS + rotation;
			var innerRotor2Pos = INNER_ROTOR_2_POS + rotation;
			var outerRotor1Pos = OUTER_ROTOR_1_POS + rotation;
			var outerRotor2Pos = OUTER_ROTOR_2_POS + rotation;
			
			// Central hub
			drawCircle(ctx, x, y, 6, true, true);
			
			// Inner blade trail
			drawArc(ctx, x, y, 23, innerRotor1Pos, innerRotor1Pos + FIFTH_CIRCLE);
			drawArc(ctx, x, y, 25, innerRotor2Pos, innerRotor2Pos + FIFTH_CIRCLE);
			
			// Change the radius of one of the arcs depending on damage
			var innerRadius;
			switch(self.health){
				case 1:
					innerRadius = 50;
					break;
				case 2:
					innerRadius = 55;
					break;
				default:
					innerRadius = 60;
			}
			
			// Outer blade trail
			drawArc(ctx, x, y, innerRadius, outerRotor1Pos, outerRotor1Pos + FIFTH_CIRCLE);
			drawArc(ctx, x, y, 60, outerRotor2Pos, outerRotor2Pos + FIFTH_CIRCLE);
		}
		
		self.fire = function(){
			// effects.play('cannon');
			
			self.assetList.add(new Bullet({
				x: self._bulletX,
				y: self._bulletY,
				speed: 10,
				speedVariation: 1,
				angle: cannonAngle,
				angleVariation: 0.1,
				bounds: self.bounds
			}));
		}
		
		// Returns an array of rects that define hit boxes for
		// the different parts of the ship. A single rect isn't
		// precise enough for a complex shape like a helicopter.
		self.getRects = function(){
			return [
				{
					top: self.y,
					right: self.x + 10,
					bottom: self.y + 60,
					left: self.x - 10
				},
				{
					top: self.y + 30,
					right: self.x + 20,
					bottom: self.y + 47,
					left: self.x - 20
				},
				{
					top: self.y + 47,
					right: self.x + 3,
					bottom: self.y + 125,
					left: self.x - 3
				},
				{
					top: self.y + 110,
					right: self.x + 15,
					bottom: self.y + 116,
					left: self.x - 15
				}
			];
		}
		
		// Check if the target hits the ship
		self.hits = function(target){
			var allRects = self.getRects();
			for(var i=0; i<allRects.length; ++i){
				if(intersectRect(target.getRect(), allRects[i])){
					return true;
				}
			}
		}
		
		// Apply damage to the ship. Returns true if the ship
		// was killed in the process, false if not.
		self.damage = function(damage){
			self.health -= damage;
			self.explode(100 * (3-self.health));
			return self.health <= 0 ? true : false;
		}
		
		// Make a particle explosion from the ship, particleCount is the
		// number of particles to release
		self.explode = function(particleCount){
			if(particleCount == undefined) particleCount = 100;
			for(var i=0; i<particleCount; ++i){
				self.assetList.add(new Particle({
					x: self.x,
					y: self.y + 40,
					speed: 10,
					speedVariation: 8,
					angle: 0,
					angleVariation: 6.28,
					bounds: self.bounds,
					life: 500
				}));
			}
		}
		
		// Destroy the ship
		self.destroy = function(options){
			self.assetList.remove(self);
		}
	}
})();
// IDEAS:
// Floaty glowing spots in the foreground kinda like the chemical
// brothers video with the glowing face.. Could be some nice depth
// effects. Depth would be good to investigate with the game anyway
// to give hte effect of motion, paralax etc.

(function(){
	
	var SPAWN_TIME = 2000;
	
	// The ship
	var ship;
	
	// The score model that we add points to when an enemy is killed
	var scoreModel;
	
	// The time that has passed since the last enemy was spawned
	var enemyTime = 0;
	
	// If we're in the game over state
	var _gameOver = false;
	
	// An array of enemy type variations that can be selected from
	// when spawning a new one
	var _enemyTypes;
	
	// All the possible enemy types in order of difficulty
	var _allEnemyTypes = [
		{
			health: 1
		},
		{
			health: 2
		},
		{
			health: 3
		},
		{
			health: 4
		},
		{
			health: 5
		}
	];
	
	var _allShipPowerups = [
		{
			burstLength: 1,
			roundDelay: 90
		},
		{
			burstLength: 2,
			roundDelay: 90
		},
		{
			burstLength: 3,
			roundDelay: 90
		},
		{
			burstLength: 5,
			roundDelay: 90
		},
		{
			burstLength: 5,
			roundDelay: 60
		}
	];
	
	// Initialize is passed an array of game assets. Add
	// to this array to automatically update and draw them
	// each frame.
	var initialize = function(assets){
		
		// Set the initial possible enemy type including the
		// first enemy only
		_enemyTypes = [_allEnemyTypes[0]];
		
		scoreModel = new ScoreModel({
			
			// When increaseDifficulty is called add the next difficulty enemy
			// to the enemy types pool. This runs through each enemy index as
			// difficultyLevel increments one each callback. If we run out of
			// enemies to add then the last (most difficult) enemy will be
			// added again to increase the likelyhood of it being selected.
			increaseDifficulty: function(difficultyLevel){
				_enemyTypes.push(_allEnemyTypes[Math.min(_allEnemyTypes.length-1, difficultyLevel)]);
			},
			
			// When increasePowerup() is called we apply the upgrade for that
			// lever to the ship for as long as there are upgrades to apply.
			increasePowerup: function(powerupLevel){
				if(_allShipPowerups.length > powerupLevel){
					ship.powerup(_allShipPowerups[powerupLevel]);
				}
			}
		});
		
		var bounds = {
			top: 0,
			right: game.width,
			bottom: game.height,
			left: 0
		};
		
		assets.add(new Background({
			width: game.width,
			height: game.height
		}));
		
		assets.add(new FrameTimer({
			bounds: bounds
		}));
		
		assets.add(new ScoreBoard({
			bounds: bounds,
			scoreModel: scoreModel
		}));
		
		ship = assets.add(new Ship({
			x: game.width/2,
			y: game.height-135,
			bounds: bounds
		}));
		ship.powerup(_allShipPowerups[0]);
	}
	
	// Update anything in addition to registered assets
	var update = function(frameTime){
		
		if(_gameOver){
			if(Input.restart()){
				_gameOver = false;
				game.start();
			}
			return;
		}
		
		// Spawn enemies as time passes
		enemyTime += frameTime;
		if(enemyTime > SPAWN_TIME){
			enemyTime -= SPAWN_TIME;
			
			// Pick a random enemy from the pool, this pool gets more difficult
			// enemies added over time as more enemies are killed.
			var options = extend({
				x: (Math.random() * (game.width-40)) + 20,
				y: -20,
				bounds: {
					top: -20,
					right: game.width,
					bottom: game.height+20,
					left: 0
				},
				escaped: scoreModel.resetMultiplier
			}, _enemyTypes[Math.floor(Math.random() * (_enemyTypes.length))]);
			
			game.assets.add(new Enemy(options));
		}
		
		var bullets = Bullet.instances;
		var enemies = Enemy.instances;
		
		// Run through each enemy to check for both bullet and ship collisions.
		// Doing this in the same loop saves on CPU time.
		for(var i=enemies.length-1; i>-1; --i){
			var enemy = enemies[i];
			var destroyed = false;
			
			// Check if any bullets hit them
			for(var r=bullets.length-1; r>-1; --r){
				var bullet = bullets[r];
				
				if(bullet.hits(enemy)){
					bullet.destroy();
					if(enemy.damage({
						damage: 1,
						angle: bullet.angle,
						speed: bullet.speed * 0.8,
						x: bullet.x,
						y: bullet.y
					})){
						// If an enemy is destroyed then we don't need to check collisions
						// against the rest of the bullets.
						destroyed = true;
						scoreModel.add(10);
						break;
					}
				}
			}
			
			// This enemy has been killed then don't check it for ship collisions
			if(destroyed) continue;
			
			// Check if they hit the ship
			if(ship.hits(enemy)){
				
				// Kill all the enemies
				killAllEnemies();
				
				// Apply the damage to the ship, if it's run out of health as a result then it's game over!
				if(ship.damage(1)){
					gameOver();
					return;
				}
			}
		}
	};
	
	// Kill all enemies
	var killAllEnemies = function(){
		var enemies = Enemy.instances;
		for(var i=enemies.length-1; i>-1; --i){
			var enemy = enemies[i];
			enemy.destroy({
				explode: true,
				x: enemy.x,
				y: enemy.y,
				speed: 5,
				angle: 0,
				angleVariation: 6.28
			});
			scoreModel.add(10);
		}
	}
	
	var gameOver = function(){
		_gameOver = true;
		
		// Destroy the ship
		ship.destroy();
		
		// Show Game Over
		game.assets.add(new GameOver({
			bounds: {
				top: 0,
				right: game.width,
				bottom: game.height,
				left: 0
			},
			scoreModel: scoreModel
		}));
	};
	
	// Draw anything in addition to registered assets
	var draw = function(ctx){};
	
	// Start the game loop
	var game = new GameLoop({
		canvas: $('#canvas'),
		initialize: initialize,
		update: update,
		draw: draw
	});
	game.start();
})();
