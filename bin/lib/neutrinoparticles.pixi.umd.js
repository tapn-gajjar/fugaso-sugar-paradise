(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('pixi.js'), require('neutrinoparticles.js')) :
  typeof define === 'function' && define.amd ? define(['exports', 'pixi.js', 'neutrinoparticles.js'], factory) :
  (global = global || self, factory(global.PIXINeutrino = {}, global.PIXI, global.Neutrino));
}(this, (function (exports, PIXI$1, Neutrino) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }

    return object;
  }

  function _get(target, property, receiver) {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get;
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);

        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);

        if (desc.get) {
          return desc.get.call(receiver);
        }

        return desc.value;
      };
    }

    return _get(target, property, receiver || target);
  }

  /**
                                                     * Main NeutrinoParticles context for PIXI.
                                                     * 
                                                     * It has to be created before loading and using any effects in the application.
                                                     * 
                                                     * Usually, the context is created automatically by {@link ApplicationPlugin} after
                                                     * PIXI.Application is created and assigned to PIXI.Application.neutrino property.
                                                     * 
                                                     * @param {PIXI.Renderer} renderer Current PIXI renderer.
                                                     * @param {PIXI.Loader} loader A loader which will be used to load textures and effects.
                                                     * @param {Object} [options={}] Options
                                                     * @param {string} [options.texturesBasePath=""] This path will be added before any texture
                                                     * path stored in a loaded effect.
                                                     * @param {boolean} [options.trimmedExtensionsLookupFirst=true] Before loading any texture
                                                     * during loading effect, will check if there is already loaded texture in the cache
                                                     * with the same name but without extension. It is useful for atlases, as they have
                                                     * sometimes textures without extensions in their description.
                                                     * @param {number} [options.maxBatchVertices=16384] Maximum number of particles vertices
                                                     * in a geometry batch. Several effects in a row can be batched together.
                                                     * @param {number} [options.maxBatchTextures=PIXI.settings.SPRITE_MAX_TEXTURES] Maximum
                                                     * number of different textures in a geometry batch. Several effects in a row can be
                                                     * batched together.
                                                     * @param {number} [options.canUploadSameBuffer=PIXI.settings.CAN_UPLOAD_SAME_BUFFER] If
                                                     * we can use the same GPU geometry buffer to upload geometry. Controlled by PIXI.
                                                     */

  var Context = /*#__PURE__*/function () {

    function Context(renderer, options) {_classCallCheck(this, Context);

      this.options = Object.assign({
        texturesBasePath: "",
        trimmedExtensionsLookupFirst: true },
      options);

      /**
                 * The context of 
                 * {@link https://gitlab.com/neutrinoparticles/neutrinoparticles.js/ | neutrinoparticles.js} library.
                 * @member {Neutrino.Context}
                 */
      this.neutrino = new Neutrino.Context();

      /**
                                               * Shows if PIXI.CanvasRenderer used.
                                               * @member {boolean}
                                               */
      this.canvasRenderer = PIXI$1.CanvasRenderer ?
      renderer instanceof PIXI$1.CanvasRenderer : false;

      /**
                                                        * If noise already initialized in a some way.
                                                        * @member {boolean}
                                                        * @private
                                                        */
      this._noiseInitialized = false;
      /**
                                       * In case if noise is being generated in multiple steps by generateNoiseStep(),
                                       * this will store NeutrinoParticles.NoiseGenerator until the process is finished.
                                       * @member {NeutrinoParticles.NoiseGenerator}
                                       * @private
                                       */
      this._noiseGenerator = null;
    }

    /**
       * Initiates loading of pre-generated noise file. This file you can find
       * in repository of 
       * {@link https://gitlab.com/neutrinoparticles/neutrinoparticles.js/ | neutrinoparticles.js} 
       * library. You will need to deploy this file with your application.
       * 
       * @param {string} path Path to the directory where 'neutrinoparticles.noise.bin' file
       * is located.
       * @param {function()} success Success callback.
       * @param {function()} fail Fail callback.
       */_createClass(Context, [{ key: "initializeNoise", value: function initializeNoise(
      path, success, fail)
      {
        if (this._noiseInitialized)
        {
          if (success) success();
          return;
        }

        this.neutrino.initializeNoise(path,
        function ()
        {
          this._noiseInitialized = true;
          if (success) success();
        },
        fail);
      }

      /**
         * Generates noise for effects in one call. It will lock script executing until finished.
         * 
         * This method should be called only once in the start of the application.
         */ }, { key: "generateNoise", value: function generateNoise()

      {
        if (this._noiseInitialized)
        return;

        var noiseGenerator = new this.neutrino.NoiseGenerator();
        while (!noiseGenerator.step()) {// approx. 5,000 steps
          // you can use 'noiseGenerator.progress' to get generating progress from 0.0 to 1.0
        }

        this._noiseInitialized = true;
      }

      /**
         * Generates noise in multiple steps. With this function you can spread noise
         * generation through multiple frames.
         * 
         * Generating noise should be made only once in the start of the application.
         * 
         * @example
         * let result;
         * do {
         *   result = app.neutrino.generateNoiseStep();
         *   const progress = result.progress; // Progress in range [0; 1]
         * 
         *   // do something with progress
         *   
         * } while (!result.done);
         */ }, { key: "generateNoiseStep", value: function generateNoiseStep()

      {
        if (this._noiseInitialized)
        {
          return { done: true, progress: 1.0 };
        }

        if (!this._noiseGenerator)
        this._noiseGenerator = new this.neutrino.NoiseGenerator();

        var result = this._noiseGenerator.step();
        var _progress = this._noiseGenerator.progress;

        if (result)
        {
          this._noiseInitialized = true;
          this._noiseGenerator = null;
        }

        return { done: result, progress: _progress };
      }

      /**
         * Options for loader to hint resource as NeutrinoParticles effect. You has to
         * hint all NeutrinoParticles effects when requesting for load. Otherwise a plain JavaScript
         * text file will be loaded.
         * 
         * @example
         * app.loader.add('my_effect', 'path/to/my/effect.js', app.neutrino.loadOptions);
         */ }, { key: "loadOptions", get: function get()

      {
        return { metadata: { neutrino: this } };
      } }]);return Context;}();

  /**
                                                                                                                                                                                                      * Application plugin which will create {@link Context} object
                                                                                                                                                                                                      * and assign it to PIXI.Application.neutrino property of the application.
                                                                                                                                                                                                      * 
                                                                                                                                                                                                      * Usually installed by {@link registerPlugins}.
                                                                                                                                                                                                      * 
                                                                                                                                                                                                      * @param {Object} options Options
                                                                                                                                                                                                      * @param {Object} options.neutrino Options object to pass to {@link Context} constructor.
                                                                                                                                                                                                      */
  var ApplicationPlugin = /*#__PURE__*/function () {function ApplicationPlugin() {_classCallCheck(this, ApplicationPlugin);}_createClass(ApplicationPlugin, null, [{ key: "init", value: function init(

      options)
      {
        this.neutrino = new Context(this.renderer, options.neutrino || {});
      } }, { key: "destroy", value: function destroy()


      {
        this.neutrino = null;
      } }]);return ApplicationPlugin;}();

  /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Renderer plugin which knows how to batch and render particles geometry.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * Basically, it is a modified PIXI.AbstractRendererPlugin. As a difference,
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * it has only one geometry buffer size (with maximum capacity). And all elements are
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              * rendered right away without storing them to make postponed flush.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              */
  var RendererPlugin = /*#__PURE__*/function (_PIXI$ObjectRenderer) {_inherits(RendererPlugin, _PIXI$ObjectRenderer);
    function RendererPlugin(renderer) {var _this;_classCallCheck(this, RendererPlugin);
      _this = _possibleConstructorReturn(this, _getPrototypeOf(RendererPlugin).call(this, renderer));

      _this.options = Object.assign({
        maxBatchVertices: 16384,
        maxBatchTextures: PIXI$1.settings.SPRITE_MAX_TEXTURES,
        canUploadSameBuffer: PIXI$1.settings.CAN_UPLOAD_SAME_BUFFER },
      renderer.options.neutrino || {});

      _this.shaderGenerator = new PIXI$1.BatchShaderGenerator(
      PIXI$1.BatchPluginFactory.defaultVertexSrc,
      PIXI$1.BatchPluginFactory.defaultFragmentTemplate);

      _this.geometryClass = PIXI$1.BatchGeometry;
      _this.vertexSize = 6;
      _this.state = PIXI$1.State.for2d();
      _this.maxVertices = _this.options.maxBatchVertices;
      _this.maxIndices = _this.maxVertices / 4 * 6;

      _this._vertexCount = 0;
      _this._indexCount = 0;
      _this._shader = null;
      _this._packedGeometries = [];
      _this._packedGeometryPoolSize = 2;
      _this._flushId = 0;
      _this.MAX_TEXTURES = 1;

      _this.renderer.on('prerender', _this.onPrerender, _assertThisInitialized(_this));
      renderer.runners.contextChange.add(_assertThisInitialized(_this));

      _this._dcIndex = 0;
      _this._aIndex = 0;
      _this._iIndex = 0;
      _this._attributeBuffer = new PIXI$1.ViewableBuffer(_this.maxVertices * _this.vertexSize * 4);
      _this._indexBuffer = new Uint16Array(_this.maxIndices);

      _this._drawCallPool = [];
      _this._textureArrayPool = [];

      _this._indices = [0, 1, 3, 1, 2, 3];

      _this._texArrayTick = 0;return _this;
    }_createClass(RendererPlugin, [{ key: "contextChange", value: function contextChange()

      {
        var gl = this.renderer.gl;

        if (PIXI$1.settings.PREFER_ENV === PIXI$1.ENV.WEBGL_LEGACY) {
          this.MAX_TEXTURES = 1;
        } else
        {
          // step 1: first check max textures the GPU can handle.
          this.MAX_TEXTURES = Math.min(
          gl.getParameter(gl.MAX_TEXTURE_IMAGE_UNITS),
          this.options.maxBatchTextures);

          // step 2: check the maximum number of if statements the shader can have too..
          this.MAX_TEXTURES = PIXI$1.checkMaxIfStatementsInShader(
          this.MAX_TEXTURES, gl);
        }

        this._shader = this.shaderGenerator.generateShader(this.MAX_TEXTURES);

        for (var i = 0; i < this._packedGeometryPoolSize; i++) {
          this._packedGeometries[i] = new this.geometryClass();
        }

        var MAX_SPRITES = this.maxVertices / 4;
        // max texture arrays
        var MAX_TA = Math.floor(MAX_SPRITES / this.MAX_TEXTURES) + 1;

        while (this._drawCallPool.length < MAX_SPRITES) {
          this._drawCallPool.push(new PIXI$1.BatchDrawCall());
        }
        while (this._textureArrayPool.length < MAX_TA) {
          this._textureArrayPool.push(new Array());
        }
      } }, { key: "onPrerender", value: function onPrerender()

      {
        this._flushId = 0;

        this._flushReset();
      } }, { key: "render", value: function render(

      vertices, texture, blendMode) {
        var batch = this.renderer.batch;

        if (!texture.valid) {
          return;
        }

        if (this._vertexCount + 4 > this.maxVertices ||
        this._indexCount + 6 > this.maxIndices)
        {
          this.flush();
        }

        this._vertexCount += 4;
        this._indexCount += 6;var


        MAX_TEXTURES =
        this.MAX_TEXTURES;

        var tex = texture.baseTexture;
        blendMode = PIXI$1.utils.premultiplyBlendMode[
        tex.alphaMode ? 1 : 0][blendMode];
        var touch = this.renderer.textureGC.count;

        var texArray = this._textureArrayPool[this._countTexArrays - 1];

        if (tex._neutrinoTick !== this._texArrayTick) {
          if (texArray.length >= MAX_TEXTURES) {
            texArray = this._textureArrayPool[this._countTexArrays++];
            ++this._texArrayTick;
          }

          var indexInArray = texArray.length;

          tex._neutrinoTick = this._texArrayTick;
          tex._neutrinoBatchLocation = indexInArray;
          tex.touched = touch;

          texArray.push(tex);
        }

        this.packInterleavedGeometry(vertices, this._attributeBuffer, this._indexBuffer, this._aIndex, this._iIndex,
        tex._neutrinoBatchLocation, tex.alphaMode != PIXI$1.ALPHA_MODES.NO_PREMULTIPLIED_ALPHA);
        this._pushDrawCall(blendMode, texArray, 4 * this.vertexSize, 6);
      } }, { key: "flush", value: function flush()

      {
        if (this._vertexCount === 0) {
          return;
        }

        this._flush();
      } }, { key: "start", value: function start()

      {
        this.renderer.state.set(this.state);

        this.renderer.shader.bind(this._shader);

        if (this.options.canUploadSameBuffer) {
          // bind buffer #0, we don't need others
          this.renderer.geometry.bind(this._packedGeometries[this._flushId]);
        }
      } }, { key: "stop", value: function stop()

      {
        this.flush();
      } }, { key: "destroy", value: function destroy()

      {
        for (var i = 0; i < this._packedGeometryPoolSize; i++) {
          if (this._packedGeometries[i]) {
            this._packedGeometries[i].destroy();
          }
        }

        this.renderer.off('prerender', this.onPrerender, this);

        this._packedGeometries = null;
        this._attributeBuffer = null;
        this._indexBuffer = null;

        if (this._shader) {
          this._shader.destroy();
          this._shader = null;
        }

        _get(_getPrototypeOf(RendererPlugin.prototype), "destroy", this).call(this);
      } }, { key: "packInterleavedGeometry", value: function packInterleavedGeometry(

      vertices, attributeBuffer, indexBuffer, aIndex, iIndex, textureId, premultiplyColor) {var

        uint32View =

        attributeBuffer.uint32View,float32View = attributeBuffer.float32View;

        var packedVertices = aIndex / this.vertexSize;

        var prepareColor = premultiplyColor ?
        function (srcColor) // In case of premultiplied texture
        {
          var alpha = srcColor[3];

          if (alpha == 0)
          {
            return 0x00000000;
          }

          if (alpha != 255)
          {
            var alphaNorm = alpha / 255.0;
            return srcColor[0] * alphaNorm |
            srcColor[1] * alphaNorm << 8 |
            srcColor[2] * alphaNorm << 16 |
            alpha << 24;
          } else

          {
            return srcColor[0] |
            srcColor[1] << 8 |
            srcColor[2] << 16 |
            alpha << 24;
          }
        } :
        function (srcColor)
        {
          return srcColor[0] |
          srcColor[1] << 8 |
          srcColor[2] << 16 |
          srcColor[3] << 24;
        };

        for (var i = 0; i < 4; ++i) {
          float32View[aIndex++] = vertices[i].position[0];
          float32View[aIndex++] = vertices[i].position[1];
          float32View[aIndex++] = vertices[i].texCoords[0];
          float32View[aIndex++] = 1.0 - vertices[i].texCoords[1];
          uint32View[aIndex++] = prepareColor(vertices[i].color);
          float32View[aIndex++] = textureId;
        }

        for (var _i = 0; _i < this._indices.length; _i++) {
          indexBuffer[iIndex++] = packedVertices + this._indices[_i];
        }
      } }, { key: "_pushDrawCall", value: function _pushDrawCall(

      blendMode, texArray, aSize, iSize) {
        var drawCall = this._drawCallPool[this._dcIndex];

        if (drawCall.blend !== blendMode ||
        drawCall.texArray !== texArray) {
          if (drawCall.size > 0) {
            drawCall = this._drawCallPool[++this._dcIndex];
          }

          drawCall.size = 0;
          drawCall.start = this._iIndex;
          drawCall.texArray = texArray;
          drawCall.blend = blendMode;
        }

        drawCall.size += iSize;

        this._aIndex += aSize;
        this._iIndex += iSize;
      } }, { key: "_bindAndClearTexArray", value: function _bindAndClearTexArray(

      texArray) {
        var textureSystem = this.renderer.texture;

        for (var j = 0; j < texArray.length; j++) {
          textureSystem.bind(texArray[j], j);
          texArray[j] = null;
        }
        texArray.length = 0;
      } }, { key: "_updateGeometry", value: function _updateGeometry()

      {var

        packedGeometries =


        this._packedGeometries,attributeBuffer = this._attributeBuffer,indexBuffer = this._indexBuffer;

        if (!this.options.canUploadSameBuffer) {/* Usually on iOS devices, where the browser doesn't
                                                like uploads to the same buffer in a single frame. */
          if (this._packedGeometryPoolSize <= this._flushId) {
            this._packedGeometryPoolSize++;
            packedGeometries[this._flushId] = new this.geometryClass();
          }

          packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData);
          packedGeometries[this._flushId]._indexBuffer.update(indexBuffer);

          this.renderer.geometry.bind(packedGeometries[this._flushId]);
          this.renderer.geometry.updateBuffers();
          this._flushId++;
        } else
        {
          // lets use the faster option, always use buffer number 0
          packedGeometries[this._flushId]._buffer.update(attributeBuffer.rawBinaryData);
          packedGeometries[this._flushId]._indexBuffer.update(indexBuffer);

          this.renderer.geometry.updateBuffers();
        }
      } }, { key: "_drawBatches", value: function _drawBatches()

      {
        var dcCount = this._dcIndex;var _this$renderer =
        this.renderer,gl = _this$renderer.gl,stateSystem = _this$renderer.state;
        var drawCalls = this._drawCallPool;

        var curTexArray = null;

        // Upload textures and do the draw calls
        for (var i = 0; i < dcCount; i++) {var _drawCalls$i =
          drawCalls[i],texArray = _drawCalls$i.texArray,type = _drawCalls$i.type,size = _drawCalls$i.size,start = _drawCalls$i.start,blend = _drawCalls$i.blend;

          if (curTexArray !== texArray) {
            curTexArray = texArray;
            this._bindAndClearTexArray(texArray);
          }

          this.state.blendMode = blend;
          stateSystem.set(this.state);
          gl.drawElements(type, size, gl.UNSIGNED_SHORT, start * 2);
        }
      } }, { key: "_flush", value: function _flush()

      {
        var drawCall = this._drawCallPool[this._dcIndex];
        if (drawCall.size > 0)
        ++this._dcIndex;

        this._updateGeometry();
        this._drawBatches();

        this._flushReset();
      } }, { key: "_flushReset", value: function _flushReset()


      {
        this._countTexArrays = 1;

        this._dcIndex = 0;
        this._aIndex = 0;
        this._iIndex = 0;
        this._vertexCount = 0;
        this._indexCount = 0;

        var drawCall = this._drawCallPool[0];

        drawCall.start = 0;
        drawCall.texArray = this._textureArrayPool[0];
        drawCall.blend = null;
        drawCall.size = 0;

        ++this._texArrayTick;
      } }]);return RendererPlugin;}(PIXI$1.ObjectRenderer);

  /**
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Represents an effect model.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * It actually wraps {@link https://gitlab.com/neutrinoparticles/neutrinoparticles.js/ | neutrinoparticles.js}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * exported effect model to perform all necessary PIXI-related integration.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Objects of this class are not created manually. Their construction is performed by {@link LoaderPlugin}.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * Used in {@link Effect} constructor.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * 
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @param {Context} context Main context for effects.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @param {string|object} neutrinoModel A string with source code of loaded effect, or created effect object.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * @param {AbstractTexturesLoader} texturesLoader Textures loader. This object will be used only if textures used
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  * by the effect are not loaded yet.
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  */
  var EffectModel = /*#__PURE__*/function (_PIXI$utils$EventEmit) {_inherits(EffectModel, _PIXI$utils$EventEmit);

    function EffectModel(context, neutrinoModel, texturesLoader)
    {var _this;_classCallCheck(this, EffectModel);
      _this = _possibleConstructorReturn(this, _getPrototypeOf(EffectModel).call(this));

      _this.ctx = context;

      if (typeof neutrinoModel === "string") {
        var evalScript = "(function(ctx) {\n" + neutrinoModel +
        "\nreturn new NeutrinoEffect(ctx);\n})(context.neutrino);";
        _this.effectModel = eval(evalScript);
      } else {
        _this.effectModel = neutrinoModel;
      }

      _this.texturesRemap = null;
      _this.textures = [];
      _this.textureImageDescs = [];

      var numTextures = _this.effectModel.textures.length;
      _this._numTexturesToLoadLeft = numTextures;

      for (var imageIndex = 0; imageIndex < numTextures; ++imageIndex)
      {
        var texturePath = _this.effectModel.textures[imageIndex];
        var texture = null;

        if (_this.ctx.options.trimmedExtensionsLookupFirst)
        {
          var trimmedTexturePath = texturePath.replace(/\.[^/.]+$/, ""); // https://stackoverflow.com/a/4250408
          texture = PIXI$1.utils.TextureCache[trimmedTexturePath];
        }

        if (!texture)
        texture = PIXI$1.utils.TextureCache[texturePath];

        if (texture)
        {
          if (texture.baseTexture.valid)
          {
            _this._onTextureLoaded(imageIndex, texture);
          } else
          {
            texture.once('update', function (self, imageIndex, texture)
            {
              return function ()
              {
                self._onTextureLoaded(imageIndex, texture);
              };
            }(_assertThisInitialized(_this), imageIndex, texture));
          }
        } else

        {
          texturesLoader.load(_this.ctx.options.texturesBasePath + texturePath,
          function (self, imageIndex)
          {
            return function (texture)
            {
              self._onTextureLoaded(imageIndex, texture);
            };
          }(_assertThisInitialized(_this), imageIndex));
        }
      }return _this;
    }

    /**
       * @returns true, if all related resources are loaded and the model is ready to use.
       */_createClass(EffectModel, [{ key: "ready", value: function ready()

      {
        return this._numTexturesToLoadLeft === 0;
      } }, { key: "_onTextureLoaded", value: function _onTextureLoaded(

      index, texture)
      {
        this.textures[index] = texture;

        this._numTexturesToLoadLeft--;

        if (this.ctx.canvasRenderer)
        {
          var image = texture.baseTexture.resource.source;
          this.textureImageDescs[index] = new this.ctx.neutrino.ImageDesc(image, texture.orig.x, texture.orig.y,
          texture.orig.width, texture.orig.height);
        }

        if (this._numTexturesToLoadLeft === 0)
        {
          if (!this.ctx.canvasRenderer)
          {
            this._initTexturesRemapIfNeeded();
          }

          this.emit('ready', this);
        }
      } }, { key: "_initTexturesRemapIfNeeded", value: function _initTexturesRemapIfNeeded()


      {
        var remapNeeded = false;

        for (var texIdx = 0; texIdx < this.textures.length; ++texIdx)
        {
          var texture = this.textures[texIdx];

          if (texture.orig.x != 0 || texture.orig.y != 0 ||
          texture.orig.width != texture.baseTexture.realWidth ||
          texture.orig.height != texture.baseTexture.realHeight)
          {
            remapNeeded = true;
            break;
          }
        }

        this.texturesRemap = [];

        if (!remapNeeded)
        return;

        for (var _texIdx = 0; _texIdx < this.textures.length; ++_texIdx)
        {
          var _texture = this.textures[_texIdx];

          this.texturesRemap[_texIdx] = new this.ctx.neutrino.SubRect(
          _texture.orig.x / _texture.baseTexture.realWidth,
          1.0 - (_texture.orig.y + _texture.orig.height) / _texture.baseTexture.realHeight,
          _texture.orig.width / _texture.baseTexture.realWidth,
          _texture.orig.height / _texture.baseTexture.realHeight);

        }
      } }]);return EffectModel;}(PIXI$1.utils.EventEmitter);

  var AbstractTexturesLoader = /*#__PURE__*/function () {

    function AbstractTexturesLoader() {_classCallCheck(this, AbstractTexturesLoader);
    }

    /**
      * Requests loading of a texture.
      * 
      * @param {string} texturePath Path to texture.
      * @param {function(texture)} callback Should be called when texture is loaded.
      */_createClass(AbstractTexturesLoader, [{ key: "load", value: function load(
      texturePath, callback) {
      } }]);return AbstractTexturesLoader;}();


  var PIXITexturesLoader = /*#__PURE__*/function () {

    function PIXITexturesLoader() {_classCallCheck(this, PIXITexturesLoader);
      this._pixiLoader = null;
      this._parentResource = null;
    }_createClass(PIXITexturesLoader, [{ key: "setPIXILoader", value: function setPIXILoader(

      pixiLoader) {
        this._pixiLoader = pixiLoader;
      } }, { key: "setParentResource", value: function setParentResource(

      parentResource) {
        this._parentResource = parentResource;
      } }, { key: "load", value: function load(

      texturePath, callback) {
        this._pixiLoader.add(texturePath,
        {
          parentResource: this._parentResource },

        function (resource)
        {
          callback(resource.texture);
        });
      } }]);return PIXITexturesLoader;}();

  var _pixiTexturesLoader = new PIXITexturesLoader();

  /**
                                                       * Plugin for PIXI.Loader.
                                                       * Usually, it is installed by {@link registerPlugins}.
                                                       */
  var LoaderPlugin = /*#__PURE__*/function () {function LoaderPlugin() {_classCallCheck(this, LoaderPlugin);}_createClass(LoaderPlugin, null, [{ key: "use", value: function use(

      resource, next)
      {
        if (resource.extension === 'js' &&
        resource.metadata &&
        resource.metadata.neutrino &&
        resource.data)
        {
          _pixiTexturesLoader.setPIXILoader(this);
          _pixiTexturesLoader.setParentResource(resource);
          resource.effectModel = new EffectModel(resource.metadata.neutrino, resource.data, _pixiTexturesLoader);
        }

        next();
      } }]);return LoaderPlugin;}();

  /**
   * Enum for pause type. Used in {@link Effect} constructor.
   * 
   * @static
   * @constant
   * @type {object}
   * @property {Symbol} NO - Not paused. Effect will start immidiately. Passed 
   * starting position and rotation considered as global and will be used 
   * to start simulate effect. Please note, that this pause type is not suitable
   * for effects you want to attach to other containers.
   * @property {Symbol} BEFORE_UPDATE_OR_RENDER - Paused until the first update or render.
   * Effect will be paused until its first update or render call. This pause type
   * is useful in most of cases when you don't want to pause effect. 
   * It allows to place effect on the scene in several subsequent methods calls:
   * create effect, attach to some parent container and set position of
   * the effect in container.
   * @property {Symbol} YES - Effect paused until unpause() called.
   */
  var Pause = Object.freeze({
    NO: Symbol(0),
    BEFORE_UPDATE_OR_RENDER: Symbol(1),
    YES: Symbol(2) });

  var _tempV3 = [0, 0, 0];

  var QuadBuffer = /*#__PURE__*/function () {

    function QuadBuffer(pushQuadCallback, projection)
    {_classCallCheck(this, QuadBuffer);
      this.worldTransform = [0, 0, 0, 0, 0, 0];
      this.worldAlpha = 1.0;

      this._pushQuadCallback = pushQuadCallback;

      function Vertex() {
        this.position = [0, 0];
        this.color = [0, 0, 0, 0];
        this.texCoords = [0, 0];
      }

      this._vertices = [
      new Vertex(),
      new Vertex(),
      new Vertex(),
      new Vertex()];


      this._currentVertex = 0;
      this._renderStyle = 0;

      this._projection = projection;
      this._quadDiscarded = false;
    }_createClass(QuadBuffer, [{ key: "initialize", value: function initialize(

      maxNumVertices, texChannels, indices, maxNumRenderCalls)
      {
      } }, { key: "beforeQuad", value: function beforeQuad(

      renderStyle)
      {
        this._renderStyle = renderStyle;
        this._quadDiscarded = false;
      } }, { key: "pushVertex", value: function pushVertex(

      vertex)
      {
        var v = this._vertices[this._currentVertex];

        var wt = this.worldTransform;

        var x = vertex.position[0];
        var y = vertex.position[1];

        _tempV3[0] = wt[0] * x + wt[2] * y + wt[4];
        _tempV3[1] = wt[1] * x + wt[3] * y + wt[5];

        if (this._projection) {
          _tempV3[2] = vertex.position[2];

          this._quadDiscarded |=
          !this._projection.transformPosition(v.position, _tempV3);
        } else {
          v.position[0] = _tempV3[0];
          v.position[1] = _tempV3[1];
        }

        v.color[0] = vertex.color[0];
        v.color[1] = vertex.color[1];
        v.color[2] = vertex.color[2];
        v.color[3] = vertex.color[3] * this.worldAlpha;

        v.texCoords[0] = vertex.texCoords[0][0];
        v.texCoords[1] = vertex.texCoords[0][1];

        ++this._currentVertex;

        if (this._currentVertex == 4)
        {
          if (!this._quadDiscarded) {
            this._pushQuadCallback(this._vertices, this._renderStyle);
          }

          this._currentVertex = 0;
        }
      } }, { key: "pushRenderCall", value: function pushRenderCall(

      rc)
      {
      } }, { key: "cleanup", value: function cleanup()


      {
      } }]);return QuadBuffer;}();

  var _cancamPoint0 = new PIXI$1.Point(0, 0);
  var _cancamPoint1 = new PIXI$1.Point(0, 0);
  var _cancamPoint2 = new PIXI$1.Point(0, 0);
  var _cancamArray0 = [0, 0, 0];
  var _rencanMatrix0 = new PIXI$1.Matrix();

  /**
                                           * Represents an instance of effect on the scene.
                                           * 
                                           * The class is a wrapper around exported NeutrinoParticles effect. It
                                           * introduces everything to place effect on a PIXI scene.
                                           * 
                                           * @example
                                           * app.loader
                                           * // Load effect using PIXI's loader. And don't forget to specify loadOptions
                                           * .add('my_effect', 'path/to/my/effect.js', app.neutrino.loadOptions)
                                           * .load((loader, resources) => 
                                           * {
                                           *   // Create effect instance using loaded model
                                           *   let effect = new PIXINeutrino.Effect(resources.my_effect.effectModel, {
                                           *     position: [400, 300, 0]
                                           *   });
                                           *   // Add effect on the scene
                                           *   app.stage.addChild(effect);
                                           * 	 // Update effect with PIXI's ticker
                                           *   app.ticker.add((delta) => {
                                           * 	   const msec = delta / PIXI.settings.TARGET_FPMS;
                                           *     const sec = msec / 1000.0;
                                           * 	   effect.update(sec);
                                           *   });
                                           * });
                                           * 
                                           * @param {EffectModel} effectModel A model which is used to instantiate and simulate effect.
                                           * @param {Object} [options={}] Options
                                           * @param {Array} [options.position=[0, 0, 0]] Location of the effect on a scene.
                                           * @param {number} [options.rotation=0] Rotation of the effect in radians. 
                                           * @param {Array} [options.scale=[1, 1, 1]]  Scale by axes for the effect.
                                           * @param {Pause} [options.pause=Pause.BEFORE_UPDATE_OR_RENDER] Pause type on start.
                                           * @param {boolean} [options.generatorsPaused=false] Generators paused on start.
                                           * @param {PIXI.Container} [options.baseParent=null] An object which defines global coordinate
                                           *   system for the effect. By default, identity coordinate system used.
                                           * @param {PerspectiveProjection} [options.projection=null] Projection to use in the effect. If null - the
                                           *   effect will be rendered using orthogonal projection (by using only X and Y values of vertices).
                                           */
  var Effect = /*#__PURE__*/function (_PIXI$Container) {_inherits(Effect, _PIXI$Container);

    function Effect(effectModel, options, arg3, arg4, arg5) {var _this2;_classCallCheck(this, Effect);
      _this2 = _possibleConstructorReturn(this, _getPrototypeOf(Effect).call(this));

      // Support for constructor(effectModel, position, rotation, scale, baseParent)
      if (options instanceof Array) {
        options = {
          position: options,
          rotation: arg3 || 0,
          scale: arg4 || [1, 1, 1],
          baseParent: arg5 || null };

      }

      options = Object.assign({
        position: [0, 0, 0],
        rotation: 0,
        scale: [1, 1, 1],
        pause: Pause.BEFORE_UPDATE_OR_RENDER,
        generatorsPaused: false,
        baseParent: null,
        projection: null },
      options);

      /** 
                 * {@link Context} used to create the effect. 
                 * @member {Context}
                 */
      _this2.ctx = effectModel.ctx;

      /** 
                                     * {@link EffectModel} used to create the effect. 
                                     * @member {EffectModel}
                                     */
      _this2.effectModel = effectModel;

      /** 
                                         * Underlying {@link https://gitlab.com/neutrinoparticles/neutrinoparticles.js/ | neutrinoparticles.js}
                                         * effect object. 
                                         * @member {object}
                                         */
      _this2.effect = null;

      /**
                             * Container which is used as global coordinate system provider.
                             * It must be one of parent containers of the effect.
                             * @member {PIXI.Container}
                             */
      _this2.baseParent = options.baseParent;

      _this2.position.set(options.position[0], options.position[1]);

      /** 
                                                                      * Z coordinate of position. X and Y coordinates are used from PIXI.Container.position. 
                                                                      * @member {number}
                                                                      */
      _this2.positionZ = options.position[2];

      _this2.rotation = options.rotation;

      _this2.scale.x = options.scale[0];
      _this2.scale.y = options.scale[1];

      /** 
                                          * Z coordinate of scale vector. X and Y coordinates are used from PIXI.Container.scale. 
                                          * @member {number}
                                          */
      _this2.scaleZ = options.scale[2];

      _this2._projection = options.projection;

      _this2._renderElements = [];
      _this2._startupOptions = {
        paused: options.pause !== Pause.NO,
        generatorsPaused: options.generatorsPaused };

      _this2._unpauseOnUpdateRender = options.pause === Pause.BEFORE_UPDATE_OR_RENDER;

      if (effectModel.ready()) {
        _this2._onEffectReady();
      } else {
        effectModel.once('ready', function () {
          this._onEffectReady();
        }, _assertThisInitialized(_this2));
      }

      _this2._updateWorldTransform();

      if (effectModel.ctx.canvasRenderer && _this2._projection) {
        var _this = _assertThisInitialized(_this2);
        _this2._canvasCameraAdapter = {
          matrix: null,
          transform: function transform(positionArray, size) {
            var worldPosition = _cancamPoint1;
            var position = _cancamPoint0;
            position.x = positionArray[0];
            position.y = positionArray[1];
            var projPosition = _cancamArray0;
            var projLocalPosition = _cancamPoint2;

            this.matrix.apply(_cancamPoint0, worldPosition);

            projPosition[0] = worldPosition.x;
            projPosition[1] = worldPosition.y;
            projPosition[2] = positionArray[2];
            var result = _this._projection.transformPosition(projPosition, projPosition);

            this.matrix.applyInverse({ x: projPosition[0], y: projPosition[1] },
            projLocalPosition);

            positionArray[0] = projLocalPosition.x;
            positionArray[1] = projLocalPosition.y;

            _this._projection.transformSize(size, projPosition, size);

            return result;
          } };

      }return _this2;
    }

    /**
       * Returns true if the effect is ready to update/render. 
       * 
       * Basically that means that {@link Effect#effectModel} is loaded 
       * and all textures required to render this effect are also loaded.
       * 
       * @returns {boolean} True if the effect can be rendered.
       */_createClass(Effect, [{ key: "ready", value: function ready()
      {
        return this._ready;
      }

      /**
         * Simulates effect for specified time.
         * 
         * @example
         * let effect = new PIXINeutrino.Effect(resources.some_effect.effectModel);
         * app.ticker.add((delta) => {
         * 	 const msec = delta / PIXI.settings.TARGET_FPMS;
         *   const sec = msec / 1000.0;
         *   effect.update(sec);
         * });
         * 
         * @param {number} seconds Time in seconds.
         */ }, { key: "update", value: function update(
      seconds) {
        if (!this.ready())
        return;

        this._checkUnpauseOnUpdateRender();

        this._updateWorldTransform();

        if (this.effect != null) {
          this.effect.update(seconds, this._scaledPosition(),
          this.ctx.neutrino.axisangle2quat_([0, 0, 1], this.worldRotationDegree));
        }
      }

      /**
         * Restarts the effect.
         * 
         * @param {Array} position A new position of the effect or null to keep the same position.
         * @param {number} rotation A new rotation of the effect of null to keep the same rotation.
         */ }, { key: "restart", value: function restart(
      position, rotation) {
        if (position) {
          this.position.x = position[0];
          this.position.y = position[1];
          this.positionZ = position[2];
        }

        if (rotation) {
          this.rotation = rotation;
        }

        this._updateWorldTransform();

        this.effect.restart(this._scaledPosition(),
        rotation ? this.ctx.neutrino.axisangle2quat_([0, 0, 1], this.worldRotationDegree) :
        null);
      }

      /**
         * Instant change of position/rotation of the effect. 
         * 
         * While {@link Effect#update} changes position 
         * of the effect smoothly interpolated, this function will prevent such smooth trail
         * from previous position and "teleport" effect instantly.
         * 
         * @param {Array} position A new position of the effect or null to keep the same position.
         * @param {number} rotation A new rotation of the effect of null to keep the same rotation.
         */ }, { key: "resetPosition", value: function resetPosition(
      position, rotation) {
        if (position) {
          this.position.x = position[0];
          this.position.y = position[1];
          this.positionZ = position[2];
        }

        if (rotation) {
          this.rotation = rotation;
        }

        this._updateWorldTransform();

        this.effect.resetPosition(this._scaledPosition(),
        rotation ? this.ctx.neutrino.axisangle2quat_([0, 0, 1], this.worldRotationDegree) : null);
      }

      /** Pauses the effect. All active particles will freeze. */ }, { key: "pause", value: function pause()
      {
        if (this.ready())
        this.effect.pauseAllEmitters();else

        this._startupOptions.paused = true;
      }

      /** Unpauses the effect. */ }, { key: "unpause", value: function unpause()
      {
        if (this.ready())
        this.effect.unpauseAllEmitters();else

        this._startupOptions.paused = false;
      }

      /** 
         * Pauses all generators in the effect. No new particles will be generated.
         * All current particles will continue to update.
         */ }, { key: "pauseGenerators", value: function pauseGenerators()
      {
        if (this.ready())
        this.effect.pauseGeneratorsInAllEmitters();else

        this._startupOptions.generatorsPaused = true;
      }

      /** Unpauses generators in the effect. */ }, { key: "unpauseGenerators", value: function unpauseGenerators()
      {
        if (this.ready())
        this.effect.unpauseGeneratorsInAllEmitters();else

        this._startupOptions.generatorsPaused = false;
      }

      /**
         * Sets a value of emitter property in all emitters of the effect.
         * 
         * @param {string} name Name of property.
         * @param {number|Array} value Value of property. It can be a Number, 
         * 2-, 3- or 4-component Array depending on a property you want to set.
         */ }, { key: "setPropertyInAllEmitters", value: function setPropertyInAllEmitters(
      name, value) {
        this.effect.setPropertyInAllEmitters(name, value);
      }

      /**
         * @returns {number} A number of active particles in the effect.
         */ }, { key: "getNumParticles", value: function getNumParticles()
      {
        return this.effect.getNumParticles();
      } }, { key: "_render", value: function _render(

      renderer)
      {
        if (!this.ready())
        return;

        this._renderer = renderer;

        this._checkUnpauseOnUpdateRender();

        if (this._projection) {
          this._projection.setScreenFrame && this._projection.setScreenFrame(renderer.projection.destinationFrame);
        }

        renderer.batch.setObjectRenderer(renderer.plugins.neutrino);

        var rb = this.renderBuffers;
        var wt = rb.worldTransform;

        if (this.baseParent)
        {
          var sx = this.worldScale.x;
          var sy = this.worldScale.y;
          var m = this.baseParent.worldTransform;
          wt[0] = m.a * sx;
          wt[1] = m.b * sy;
          wt[2] = m.c * sx;
          wt[3] = m.d * sy;
          wt[4] = m.tx * sx;
          wt[5] = m.ty * sy;
        } else {
          wt[0] = this.worldScale.x;
          wt[1] = 0;
          wt[2] = 0;
          wt[3] = this.worldScale.y;
          wt[4] = 0;
          wt[5] = 0;
        }

        rb.worldAlpha = this.worldAlpha;

        this.effect.fillGeometryBuffers([1, 0, 0], [0, -1, 0], [0, 0, -1]);

        this._renderer = null;
      } }, { key: "_renderCanvas", value: function _renderCanvas(

      renderer)
      {
        if (!this.ready())
        return;

        this._checkUnpauseOnUpdateRender();

        var matrix = _rencanMatrix0;

        if (this.baseParent)
        {
          this.baseParent.worldTransform.copyTo(matrix);
          matrix.scale(this.worldScale.x, this.worldScale.y);
          renderer.context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        } else

        {
          matrix.set(this.worldScale.x, 0, 0, this.worldScale.y, 0, 0);
          renderer.context.setTransform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty);
        }

        if (this._projection) {
          this._canvasCameraAdapter.matrix = matrix;
          this._projection.setScreenFrame && this._projection.setScreenFrame(renderer.screen);
        }

        renderer.context.save();

        renderer.context.globalAlpha = this.worldAlpha;
        this.effect.draw(renderer.context, this._canvasCameraAdapter);

        renderer.context.restore();
      } }, { key: "_scaledPosition", value: function _scaledPosition()

      {
        return [this.worldPosition.x / this.worldScale.x, this.worldPosition.y /
        this.worldScale.y, this.positionZ / this.scaleZ];
      } }, { key: "_updateWorldTransform", value: function _updateWorldTransform()

      {
        var localPosition = new PIXI$1.Point(0, 0);
        var localXAxis = new PIXI$1.Point(1, 0);
        var localYAxis = new PIXI$1.Point(0, 1);

        var worldXAxis, worldYAxis;

        if (this.baseParent)
        {
          this.worldPosition = this.baseParent.toLocal(localPosition, this);
          worldXAxis = this.baseParent.toLocal(localXAxis, this);
          worldYAxis = this.baseParent.toLocal(localYAxis, this);
        } else {
          this.worldPosition = this.toGlobal(localPosition);
          worldXAxis = this.toGlobal(localXAxis);
          worldYAxis = this.toGlobal(localYAxis);
        }

        worldXAxis.x -= this.worldPosition.x;
        worldXAxis.y -= this.worldPosition.y;
        worldYAxis.x -= this.worldPosition.x;
        worldYAxis.y -= this.worldPosition.y;

        this.worldScale = {
          x: Math.sqrt(worldXAxis.x * worldXAxis.x + worldXAxis.y * worldXAxis.y),
          y: Math.sqrt(worldYAxis.x * worldYAxis.x + worldYAxis.y * worldYAxis.y) };


        this.worldRotationDegree = this._calcWorldRotation(this) / Math.PI * 180 % 360;
      } }, { key: "_calcWorldRotation", value: function _calcWorldRotation(

      obj) {
        if (obj.parent && obj.parent != this.baseParent)
        return obj.rotation + this._calcWorldRotation(obj.parent);else

        return obj.rotation;
      } }, { key: "_onEffectReady", value: function _onEffectReady()

      {var _this3 = this;
        this._updateWorldTransform();

        if (this.effectModel.ctx.canvasRenderer) {
          this.effect = this.effectModel.effectModel.createCanvas2DInstance(this._scaledPosition(),
          this.ctx.neutrino.axisangle2quat_([0, 0, 1], this.worldRotationDegree),
          this._startupOptions);
          this.effect.textureDescs = this.effectModel.textureImageDescs;
        } else {
          this.renderBuffers = new QuadBuffer(function (vertices, renderStyle) {
            _this3._pushQuad(vertices, renderStyle);
          }, this._projection);
          this._updateWorldTransform();
          this.effect = this.effectModel.effectModel.createWGLInstance(this._scaledPosition(),
          this.ctx.neutrino.axisangle2quat_([0, 0, 1], this.worldRotationDegree), this.renderBuffers,
          this._startupOptions);
          this.effect.texturesRemap = this.effectModel.texturesRemap;
        }

        this._ready = true;
        this.emit('ready', this);
      } }, { key: "_checkUnpauseOnUpdateRender", value: function _checkUnpauseOnUpdateRender()

      {
        if (this._unpauseOnUpdateRender) {
          this.resetPosition();
          this.unpause();
          this._unpauseOnUpdateRender = false;
        }
      } }, { key: "_pushQuad", value: function _pushQuad(

      vertices, renderStyleIndex)
      {
        var renderStyle = this.effect.model.renderStyles[renderStyleIndex];
        var texIndex = renderStyle.textureIndices[0];
        var texture = this.effectModel.textures[texIndex];
        var material = this.effect.model.materials[renderStyle.materialIndex];

        var blendMode;
        switch (material) {

          default:blendMode = PIXI$1.BLEND_MODES.NORMAL;break;
          case 1:blendMode = PIXI$1.BLEND_MODES.ADD;break;
          case 2:blendMode = PIXI$1.BLEND_MODES.MULTIPLY;break;}


        this._renderer.plugins.neutrino.render(vertices, texture, blendMode);
      } }]);return Effect;}(PIXI$1.Container);

  /**
                                                                                                                                                                  * The class implements perspective projection transformation.
                                                                                                                                                                  * 
                                                                                                                                                                  * @example
                                                                                                                                                                  * app.loader
                                                                                                                                                                  * // Load effect using PIXI's loader. And don't forget to specify loadOptions
                                                                                                                                                                  * .add('my_effect', 'path/to/my/effect.js', app.neutrino.loadOptions)
                                                                                                                                                                  * .load((loader, resources) => 
                                                                                                                                                                  * {
                                                                                                                                                                  *   // Create effect instance using loaded model
                                                                                                                                                                  *   let effect = new PIXINeutrino.Effect(resources.my_effect.effectModel, {
                                                                                                                                                                  *     position: [400, 300, 0],
                                                                                                                                                                  *     projection: new PIXINeutrino.PerspectiveProjection(60.0)
                                                                                                                                                                  *   });
                                                                                                                                                                  *   // Add effect on the scene
                                                                                                                                                                  *   app.stage.addChild(effect);
                                                                                                                                                                  * 	 // Update effect with PIXI's ticker
                                                                                                                                                                  *   app.ticker.add((delta) => {
                                                                                                                                                                  * 	   const msec = delta / PIXI.settings.TARGET_FPMS;
                                                                                                                                                                  *     const sec = msec / 1000.0;
                                                                                                                                                                  * 	   effect.update(sec);
                                                                                                                                                                  *   });
                                                                                                                                                                  * });
                                                                                                                                                                  * 
                                                                                                                                                                  * @param {number} [horizontalAngle] Horizontal angle of the perspective projection in degrees.
                                                                                                                                                                  */

  var PerspectiveProjection = /*#__PURE__*/function () {

    function PerspectiveProjection(horizontalAngle) {_classCallCheck(this, PerspectiveProjection);
      this.horizontalAngle = horizontalAngle;
    }

    /**
      * Changes horizontal angle of the projection.
      * 
      * @param {number} value Angle in degrees.
      */_createClass(PerspectiveProjection, [{ key: "setScreenFrame",





      /**
                                                                       * Sets rendering frame for the projection.
                                                                       * 
                                                                       * This method shouldn't be called manually when the class is used with effects. It is called
                                                                       * on every render call for each effect automatically.
                                                                       * @param {PIXI.Rectangle} frame Rendering frame.
                                                                       */value: function setScreenFrame(
      frame) {
        this._screenWidth = frame.width;
        this._screenHeight = frame.height;
        this._screenPosX = frame.x + frame.width * 0.5;
        this._screenPosY = frame.y + frame.height * 0.5;
        this._z = this._screenWidth * 0.5 / this._angleTan;
        this._near = this._z * 0.99;
      }

      /**
         * Transforms 3D point accordingly to the projection.
         * 
         * Basically, point's position X and Y components are simply scaled dependently on Z position. The method
         * is used in WebGL and Canvas rendering.
         * 
         * @param {Array} out [x, y] Transformed position.
         * @param {Array} pos [x, y, z] Untransformed input vertex position.
         * @returns false, if a particle is on the back side of the camera and should be discarded. Otherwise - true.
         */ }, { key: "transformPosition", value: function transformPosition(
      out, pos) {
        if (pos[2] > this._near) {
          return false;
        }

        var scale = this._getScale(pos);
        out[0] = (pos[0] - this._screenPosX) * scale + this._screenPosX;
        out[1] = (pos[1] - this._screenPosY) * scale + this._screenPosY;

        return true;
      }

      /**
         * Transforms 2D size of a particle accordingly to the projection.
         * 
         * Basically, size is simply scaled dependently on Z position of a particle. The method is used
         * only in Canvas rendering.
         * 
         * @param {Array} outSize [width, height] Transformed size.
         * @param {Array} pos [x, y, z] Untransformed particle position.
         * @param {Array} size [width, height] Untransformed size.
         */ }, { key: "transformSize", value: function transformSize(
      outSize, pos, size) {
        var scale = this._getScale(pos);
        outSize[0] = size[0] * scale;
        outSize[1] = size[1] * scale;
      } }, { key: "_getScale", value: function _getScale(

      pos) {
        return this._z / (this._z - pos[2]);
      } }, { key: "horizontalAngle", set: function set(value) {this._horizontalAngle = value;this._angleTan = Math.tan(value * 0.5 / 180.0 * Math.PI);} }]);return PerspectiveProjection;}();

  /**
                                                  * Registers all plugins in PIXI. Namely {@link ApplicationPlugin}, {@link RendererPlugin} and
                                                  * {@link LoaderPlugin}.
                                                  * 
                                                  * Should be called before PIXI.Application created.
                                                  */
  function registerPlugins()
  {
    PIXI.Application.registerPlugin(ApplicationPlugin);
    PIXI.Renderer.registerPlugin('neutrino', RendererPlugin);
    PIXI.Loader.registerPlugin(LoaderPlugin);
  }

  exports.AbstractTexturesLoader = AbstractTexturesLoader;
  exports.ApplicationPlugin = ApplicationPlugin;
  exports.Context = Context;
  exports.Effect = Effect;
  exports.EffectModel = EffectModel;
  exports.LoaderPlugin = LoaderPlugin;
  exports.PIXITexturesLoader = PIXITexturesLoader;
  exports.Pause = Pause;
  exports.PerspectiveProjection = PerspectiveProjection;
  exports.QuadBuffer = QuadBuffer;
  exports.RendererPlugin = RendererPlugin;
  exports.registerPlugins = registerPlugins;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=neutrinoparticles.pixi.umd.js.map
