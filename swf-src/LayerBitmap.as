package com.sbi.graphics
{
   import com.sbi.corelib.Set;
   import com.sbi.loader.ImageServerURL;
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.geom.Matrix;
   import flash.geom.Point;
   import flash.geom.Rectangle;
   import flash.utils.ByteArray;
   import flash.utils.Dictionary;
   
   public class LayerBitmap extends Bitmap
   {
      
      public static const BACKGROUND_COLOR:uint = 0;

      // an animal whose player put its clothes in an order of their own (the
      // avatar editor's layers panel, AvatarUtility.orderLayers): each worn
      // piece has a place ORDER_BASE + its rank, bottom first, painted after
      // every body slot (paint). an animal without one is painted by slot,
      // exactly as before.
      public static const ORDER_BASE:int = 300;

      public static const ORDER_MAX:int = 64;

      private var _anchorPoint:Point;
      
      private var _activeLayerGroup:LayerGroup;
      
      private var _bmin:Point;
      
      private var _bmax:Point;
      
      private var _lastFrame:int;
      
      private var _lastHFlip:Boolean;
      
      private var _blendColor:uint;
      
      private var _cachedLayerGroups:Dictionary;
      
      private var _currCacheKey:String;
      
      public function LayerBitmap()
      {
         super();
         _activeLayerGroup = new LayerGroup();
         _anchorPoint = new Point();
         _bmin = new Point();
         _bmax = new Point();
         _cachedLayerGroups = new Dictionary();
      }
      
      public function destroy() : void
      {
         if(_currCacheKey == null)
         {
            _activeLayerGroup.destroy();
         }
         for each(var _loc1_:LayerGroup in _cachedLayerGroups)
         {
            _loc1_.destroy();
         }
         _cachedLayerGroups = null;
         if(this.bitmapData)
         {
            this.bitmapData.dispose();
            this.bitmapData = null;
         }
      }
      
      public function get length() : int
      {
         return _activeLayerGroup.length;
      }
      
      public function release() : void
      {
         for each(var _loc1_:LayerGroup in _cachedLayerGroups)
         {
            _loc1_.destroy();
         }
         _cachedLayerGroups = new Dictionary();
         if(_currCacheKey == null)
         {
            _activeLayerGroup.destroy();
         }
         else
         {
            _currCacheKey = null;
         }
         _activeLayerGroup = new LayerGroup();
         invalidate();
         _lastHFlip = false;
      }
      
      public function invalidate() : void
      {
         _lastFrame = -1;
      }

      // a custom item's picture has loaded (AJClient.customArtBitmap). the
      // frames painted while it loaded show the item it was made from, and
      // are kept: each is painted again, or the picture shows only on the
      // frames not painted yet (and comes and goes as the animation plays).
      public function artArrived() : void
      {
         var _loc1_:Array = [_activeLayerGroup];
         for each(var _loc2_:LayerGroup in _cachedLayerGroups)
         {
            _loc1_.push(_loc2_);
         }
         for each(var _loc3_:LayerGroup in _loc1_)
         {
            if(_loc3_ == null || _loc3_.paintedFrames == null)
            {
               continue;
            }
            for each(var _loc4_:Array in _loc3_.paintedFrames)
            {
               if(_loc4_ == null)
               {
                  continue;
               }
               if(_loc4_[false] != null)
               {
                  _loc4_[false].isValid = false;
               }
               if(_loc4_[true] != null)
               {
                  _loc4_[true].isValid = false;
               }
            }
         }
         invalidate();
      }
      
      public function trimLayerGroups() : Set
      {
         var _loc3_:LayerGroup = null;
         var _loc2_:Set = new Set();
         for(var _loc4_:Object in _cachedLayerGroups)
         {
            if(_loc4_ != _currCacheKey)
            {
               _loc3_ = _cachedLayerGroups[_loc4_];
               if(_loc3_.decrementTtl() < 1)
               {
                  delete _cachedLayerGroups[_loc4_];
                  _loc3_.destroy();
                  continue;
               }
            }
            // the image ids come before any "|" (LayerAnim.requestAnim adds
            // custom pictures and the player's own clothes order after it)
            for each(var _loc1_:int in String(_loc4_).split("|")[0].split(","))
            {
               _loc2_.add(_loc1_);
            }
         }
         return _loc2_;
      }
      
      // where an item goes: the first in a body slot (1 to 10) has the slot's
      // own place, as the game always had it; a second, third ... worn in the
      // same slot goes to 100 + slot * 16 + n, which paint draws right after
      // that slot, so that every worn item shows, the later over the earlier
      public static function slotFor(param1:int, param2:int) : int
      {
         if(param2 <= 0 || param1 <= 0)
         {
            return param1;
         }
         return 100 + param1 * 16 + Math.min(param2,15);
      }

      // a layer's place: its rank in the player's own order (`param3`, -1
      // when there is none), else its slot's (slotFor)
      public static function keyFor(param1:int, param2:int, param3:int) : int
      {
         if(param3 >= 0 && param1 > 3)
         {
            return ORDER_BASE + Math.min(param3,ORDER_MAX - 1);
         }
         return slotFor(param1,param2);
      }
      
      // `param5`: the item this layer is (a custom one may be worn as its own
      // picture: paintLayer), 0 for one of the game's or none known
      public function setLayer(param1:int, param2:Object, param3:uint, param4:String = null, param5:int = 0) : void
      {
         if(param1 < 0 || param1 > 10 && param1 < 117 || param1 > 275 && param1 < ORDER_BASE || param1 >= ORDER_BASE + ORDER_MAX)
         {
            return;
         }
         if(param4 != null)
         {
            if(param4 != _currCacheKey)
            {
               if(_currCacheKey == null)
               {
                  _cachedLayerGroups[param4] = _activeLayerGroup;
               }
               else
               {
                  if(!_cachedLayerGroups[param4])
                  {
                     _cachedLayerGroups[param4] = new LayerGroup();
                  }
                  _activeLayerGroup = _cachedLayerGroups[param4];
               }
               _currCacheKey = param4;
            }
         }
         if(param2)
         {
            if(_activeLayerGroup.layers[param1] == null)
            {
               _activeLayerGroup.layers[param1] = {
                  "c":param3,
                  "lastColor":-1,
                  "blendColor":-1
               };
               _activeLayerGroup.checkColors = true;
            }
            else
            {
               setLayerColor(param1,param3);
            }
            _activeLayerGroup.layers[param1].o = param2;
            _activeLayerGroup.layers[param1].item = param5;
         }
         else
         {
            delete _activeLayerGroup.layers[param1];
            _activeLayerGroup.checkColors = true;
         }
         invalidate();
      }
      
      public function setLayerColor(param1:int, param2:uint) : void
      {
         var _loc3_:Object = _activeLayerGroup.layers[param1];
         if(_loc3_ && param2 != _loc3_.c)
         {
            _loc3_.c = param2;
            _activeLayerGroup.checkColors = true;
         }
      }
      
      public function setBlendColor(param1:uint) : void
      {
         if(_blendColor != param1)
         {
            _blendColor = param1;
            for each(var _loc2_:LayerGroup in _cachedLayerGroups)
            {
               _loc2_.checkColors = true;
            }
         }
      }
      
      public function switchLayerGroup(param1:Array, param2:String = null) : Boolean
      {
         var _loc6_:int = 0;
         var _loc4_:LayerGroup = param2 == null ? _activeLayerGroup : _cachedLayerGroups[param2];
         if(_loc4_ == null || param1 == null)
         {
            return false;
         }
         var _loc3_:ImageServerURL = ImageServerURL.instance;
         for each(var _loc5_:Object in param1)
         {
            _loc6_ = _loc3_.getLayerIndex(_loc5_.l);
            if(!_loc4_.layers[_loc6_])
            {
               return false;
            }
            if(_loc4_.layers[_loc6_].c != _loc5_.c)
            {
               _loc4_.layers[_loc6_].c = _loc5_.c;
               _loc4_.checkColors = true;
            }
         }
         if(param2 != null && param2 != _currCacheKey)
         {
            _activeLayerGroup = _cachedLayerGroups[param2];
            _currCacheKey = param2;
         }
         invalidate();
         return true;
      }
      
      public function get anchorPoint() : Point
      {
         return _anchorPoint;
      }
      
      private function refreshLayerPalette(param1:int) : Boolean
      {
         var _loc7_:Boolean = false;
         var _loc5_:* = 0;
         var _loc6_:Array = null;
         var _loc8_:int = 0;
         var _loc10_:int = 0;
         var _loc2_:int = 0;
         var _loc3_:int = 0;
         var _loc4_:int = 0;
         var _loc9_:Object = _activeLayerGroup.layers[param1];
         if(_loc9_)
         {
            _loc7_ = param1 == 3;
            if(_loc9_.lastColor != _loc9_.c || !_loc7_ && _loc9_.blendColor != _blendColor)
            {
               _loc5_ = uint(_loc9_.c);
               _loc6_ = PaletteHelper.gamePalette;
               _loc8_ = _loc5_ >> 24 & 0xFF;
               _loc10_ = _loc5_ >> 16 & 0xFF;
               _loc2_ = _loc5_ >> 8 & 0xFF;
               _loc3_ = _loc5_ & 0xFF;
               if(!_loc9_.pal)
               {
                  _loc9_.pal = [];
               }
               PaletteHelper.BuildAnimalPalette(_loc9_.pal,_loc6_[_loc8_],_loc6_[_loc10_],_loc6_[_loc2_],_loc6_[_loc3_]);
               if(!_loc7_)
               {
                  _loc4_ = _blendColor >> 24 & 0xFF;
                  if(_loc4_ > 0)
                  {
                     PaletteHelper.adjustPaletteColor(_loc9_.pal,_blendColor);
                  }
                  _loc9_.blendColor = _blendColor;
               }
               _loc9_.lastColor = _loc5_;
               return true;
            }
         }
         return false;
      }
      
      private function refreshAllPalettes() : Boolean
      {
         var _loc2_:Boolean = false;
         for(var _loc1_ in _activeLayerGroup.layers)
         {
            if(_loc1_ > 0)
            {
               if(refreshLayerPalette(_loc1_))
               {
                  _loc2_ = true;
               }
            }
         }
         if(_loc2_)
         {
            _activeLayerGroup.invalidate();
         }
         return _loc2_;
      }
      
      private function calcBounds(param1:int) : void
      {
         var _loc4_:Object = null;
         var _loc10_:Object = null;
         var _loc3_:int = 0;
         var _loc8_:Object = null;
         var _loc2_:int = 0;
         var _loc9_:int = 0;
         var _loc5_:int = 0;
         var _loc6_:int = 0;
         _bmin.setTo(1000,1000);
         _bmax.setTo(0,0);
         for(var _loc7_ in _activeLayerGroup.layers)
         {
            if(_loc7_ != 0)
            {
               _loc4_ = _activeLayerGroup.layers[_loc7_];
               _loc10_ = _loc4_.o;
               if(_loc10_.v != 117967104)
               {
                  return;
               }
               _loc3_ = int(_loc10_.f.length);
               if(param1 < _loc3_)
               {
                  _loc8_ = _loc10_.f[param1];
                  if(_loc8_)
                  {
                     _loc2_ = int(_loc8_.x);
                     _loc9_ = int(_loc8_.y);
                     _loc5_ = int(_loc8_.w);
                     _loc6_ = int(_loc8_.h);
                     if(_loc2_ < _bmin.x)
                     {
                        _bmin.x = _loc2_;
                     }
                     if(_loc9_ < _bmin.y)
                     {
                        _bmin.y = _loc9_;
                     }
                     if(_loc2_ + _loc5_ > _bmax.x)
                     {
                        _bmax.x = _loc2_ + _loc5_;
                     }
                     if(_loc9_ + _loc6_ > _bmax.y)
                     {
                        _bmax.y = _loc9_ + _loc6_;
                     }
                  }
               }
            }
         }
         if(_bmin.x == 1000 || _bmin.y == 1000)
         {
            trace("WARNING: detected frame with unexpected bounds - currCacheKey:" + _currCacheKey + " index:" + param1 + " bmin.x:" + _bmin.x + " bmin.y:" + _bmin.y + " bmax.x:" + _bmax.x + " bmax.y:" + _bmax.y);
            _bmin.copyFrom(_bmax);
         }
      }
      
      private function switchFrame() : Boolean
      {
         var _loc1_:Boolean = false;
         var _loc2_:Array = _activeLayerGroup.paintedFrames;
         if(!_loc2_[_lastFrame])
         {
            _loc2_[_lastFrame] = [];
            createFrame(_loc2_[_lastFrame]);
         }
         else if(_loc2_[_lastFrame][_lastHFlip] != null && _loc2_[_lastFrame][_lastHFlip].isValid)
         {
            _loc2_[_lastFrame][_lastHFlip].copyBoundsTo(_bmin,_bmax);
            _loc1_ = true;
         }
         else if(_loc2_[_lastFrame][!_lastHFlip] != null && _loc2_[_lastFrame][!_lastHFlip].isValid)
         {
            _loc2_[_lastFrame][_lastHFlip] = _loc2_[_lastFrame][!_lastHFlip].flip();
            _loc2_[_lastFrame][_lastHFlip].copyBoundsTo(_bmin,_bmax);
            _loc1_ = true;
         }
         else
         {
            createFrame(_loc2_[_lastFrame]);
         }
         this.bitmapData = _loc2_[_lastFrame][_lastHFlip].frameData;
         _loc2_[_lastFrame][_lastHFlip].updateAnchorPoint(_anchorPoint,_lastHFlip);
         return _loc1_;
      }
      
      private function createFrame(param1:Array) : void
      {
         calcBounds(_lastFrame);
         if(param1[_lastHFlip] == null)
         {
            param1[_lastHFlip] = new PaintedFrame(_bmin,_bmax);
         }
         else if(!param1[_lastHFlip].validateBounds(_bmin,_bmax))
         {
            param1[_lastHFlip].destroy();
            param1[_lastHFlip] = new PaintedFrame(_bmin,_bmax);
         }
         else
         {
            param1[_lastHFlip].isValid = true;
         }
      }
      
      public function paint(param1:int, param2:Boolean = false, param3:Boolean = true) : Boolean
      {
         var _loc6_:Object = null;
         var _loc4_:Boolean = false;
         var _loc7_:Boolean = false;
         var _loc5_:int = 0;
         _activeLayerGroup.resetTtl();
         if(param3 && _activeLayerGroup.layers[0] != null)
         {
            _loc6_ = _activeLayerGroup.layers[0];
            param1 = int(_loc6_.o.f[param1]);
         }
         if(_activeLayerGroup.checkColors)
         {
            _loc7_ = refreshAllPalettes();
            _activeLayerGroup.checkColors = false;
         }
         if(param1 != _lastFrame || param2 != _lastHFlip || _loc7_)
         {
            _lastFrame = param1;
            _lastHFlip = param2;
            if(!switchFrame())
            {
               _loc5_ = 1;
               while(_loc5_ <= 10)
               {
                  _loc6_ = _activeLayerGroup.layers[_loc5_];
                  if(_loc6_ != null && _loc6_.o != null && _loc6_.pal != null)
                  {
                     if(paintLayer(_loc6_,param1,param2))
                     {
                        _loc4_ = true;
                     }
                  }
                  // more items worn in this slot (slotFor)
                  var _loc8_:int = 1;
                  while(_loc8_ <= 15)
                  {
                     _loc6_ = _activeLayerGroup.layers[100 + _loc5_ * 16 + _loc8_];
                     if(_loc6_ != null && _loc6_.o != null && _loc6_.pal != null)
                     {
                        if(paintLayer(_loc6_,param1,param2))
                        {
                           _loc4_ = true;
                        }
                     }
                     _loc8_++;
                  }
                  _loc5_++;
               }
               // the player's own order of their clothes (ORDER_BASE), over the body
               _loc5_ = ORDER_BASE;
               while(_loc5_ < ORDER_BASE + ORDER_MAX)
               {
                  _loc6_ = _activeLayerGroup.layers[_loc5_];
                  if(_loc6_ != null && _loc6_.o != null && _loc6_.pal != null)
                  {
                     if(paintLayer(_loc6_,param1,param2))
                     {
                        _loc4_ = true;
                     }
                  }
                  _loc5_++;
               }
            }
         }
         return _loc4_;
      }
      
      // a layer, as the game paints it, or a custom item's own picture
      // (AJClient.customArtMode): "sticker", the picture fitted in the
      // item's place in this frame; "texture", the item's shape with the
      // picture in it, its outlines kept. while the picture loads it is
      // painted as the item it was made from.
      private static var _scratch:BitmapData;

      private function paintLayer(param1:Object, param2:int, param3:Boolean) : Boolean
      {
         var _loc4_:String = param1.item > 0 ? AJClient.customArtMode("clothing",param1.item) : null;
         var _loc5_:BitmapData = _loc4_ != null ? AJClient.customArtBitmap("clothing",param1.item,this) : null;
         if(_loc5_ == null || param1.o == null || !param1.o.hasOwnProperty("f") || param2 >= param1.o.f.length || param1.o.f[param2] == null)
         {
            return paintFrame(param1.o,param2,param1.pal,param3);
         }
         var _loc6_:Object = param1.o.f[param2];
         var _loc7_:BitmapData = this.bitmapData;
         if(_loc7_ == null)
         {
            return false;
         }
         var _loc8_:Number = _bmax.x - _bmin.x;
         var _loc9_:Number = int(_loc6_.x) - _bmin.x;
         var _loc10_:Number = int(_loc6_.y) - _bmin.y;
         var _loc11_:Number = int(_loc6_.w);
         var _loc12_:Number = int(_loc6_.h);
         if(param3)
         {
            _loc9_ = _loc8_ - _loc9_ - _loc11_;
         }
         if(_loc4_ == "sticker")
         {
            var _loc13_:Number = Math.min(_loc11_ / _loc5_.width,_loc12_ / _loc5_.height);
            var _loc14_:Matrix = new Matrix();
            if(param3)
            {
               _loc14_.scale(-_loc13_,_loc13_);
               _loc14_.translate(_loc9_ + (_loc11_ + _loc5_.width * _loc13_) * 0.5,_loc10_ + (_loc12_ - _loc5_.height * _loc13_) * 0.5);
            }
            else
            {
               _loc14_.scale(_loc13_,_loc13_);
               _loc14_.translate(_loc9_ + (_loc11_ - _loc5_.width * _loc13_) * 0.5,_loc10_ + (_loc12_ - _loc5_.height * _loc13_) * 0.5);
            }
            _loc7_.draw(_loc5_,_loc14_,null,null,null,true);
            return true;
         }
         // the texture: the layer alone first, then its pixels from the picture
         if(_scratch == null || _scratch.width < _loc7_.width || _scratch.height < _loc7_.height)
         {
            if(_scratch != null)
            {
               _scratch.dispose();
            }
            _scratch = new BitmapData(Math.max(_loc7_.width,256),Math.max(_loc7_.height,256),true,0);
         }
         _scratch.fillRect(_scratch.rect,0);
         this.bitmapData = _scratch;
         var _loc15_:Boolean = paintFrame(param1.o,param2,param1.pal,param3);
         this.bitmapData = _loc7_;
         if(!_loc15_)
         {
            return false;
         }
         var _loc16_:int = Math.max(0,int(_loc9_));
         var _loc17_:int = Math.max(0,int(_loc10_));
         var _loc18_:int = Math.min(_loc7_.width,int(_loc9_ + _loc11_));
         var _loc19_:int = Math.min(_loc7_.height,int(_loc10_ + _loc12_));
         var _loc20_:int = _loc17_;
         while(_loc20_ < _loc19_)
         {
            var _loc21_:int = _loc16_;
            while(_loc21_ < _loc18_)
            {
               var _loc22_:uint = _scratch.getPixel32(_loc21_,_loc20_);
               var _loc23_:uint = _loc22_ >>> 24;
               if(_loc23_ > 0)
               {
                  var _loc24_:Number = (((_loc22_ >> 16) & 0xFF) * 3 + ((_loc22_ >> 8) & 0xFF) * 6 + (_loc22_ & 0xFF)) / 10;
                  // dark: an outline, kept
                  if(_loc24_ >= 60)
                  {
                     var _loc25_:int = int(((param3 ? _loc18_ - 1 - _loc21_ : _loc21_ - _loc16_) / Math.max(1,_loc18_ - _loc16_)) * _loc5_.width);
                     var _loc26_:int = int(((_loc20_ - _loc17_) / Math.max(1,_loc19_ - _loc17_)) * _loc5_.height);
                     var _loc27_:uint = _loc5_.getPixel32(Math.min(_loc5_.width - 1,_loc25_),Math.min(_loc5_.height - 1,_loc26_));
                     // its shading kept: lighter or darker as the item was there
                     var _loc28_:Number = Math.max(0.55,Math.min(1.15,_loc24_ / 170));
                     var _loc29_:uint = Math.min(255,((_loc27_ >> 16) & 0xFF) * _loc28_);
                     var _loc30_:uint = Math.min(255,((_loc27_ >> 8) & 0xFF) * _loc28_);
                     var _loc31_:uint = Math.min(255,(_loc27_ & 0xFF) * _loc28_);
                     var _loc32_:uint = Math.min(_loc23_,_loc27_ >>> 24);
                     _scratch.setPixel32(_loc21_,_loc20_,_loc32_ << 24 | _loc29_ << 16 | _loc30_ << 8 | _loc31_);
                  }
               }
               _loc21_++;
            }
            _loc20_++;
         }
         _loc7_.copyPixels(_scratch,new Rectangle(0,0,_loc7_.width,_loc7_.height),new Point(0,0),null,null,true);
         return true;
      }

      private function paintFrame(param1:Object, param2:int, param3:Array, param4:Boolean) : Boolean
      {
         var _loc25_:int = 0;
         var _loc18_:int = 0;
         var _loc13_:* = 0;
         var _loc15_:* = 0;
         var _loc31_:int = 0;
         var _loc20_:int = 0;
         var _loc8_:int = 0;
         var _loc26_:int = 0;
         var _loc5_:int = 0;
         var _loc21_:int = 0;
         var _loc10_:int = 0;
         var _loc27_:int = 0;
         var _loc9_:int = 0;
         var _loc14_:Number = NaN;
         var _loc23_:* = 0;
         var _loc12_:int = 0;
         if(param1 == null || !param1.hasOwnProperty("f"))
         {
            return false;
         }
         if(param2 >= param1.f.length)
         {
            return false;
         }
         var _loc24_:Object = param1.f[param2];
         if(!_loc24_)
         {
            return false;
         }
         var _loc6_:BitmapData = this.bitmapData;
         if(_loc6_ == null)
         {
            return false;
         }
         _loc6_.lock();
         var _loc22_:ByteArray = _loc24_.b;
         var _loc11_:int = int(_loc24_.x);
         var _loc7_:int = int(_loc24_.y);
         var _loc28_:int = int(_loc24_.w);
         var _loc17_:int = int(_loc24_.h);
         _loc11_ -= _bmin.x;
         _loc7_ -= _bmin.y;
         _loc28_ += _loc11_;
         _loc22_.position = 0;
         var _loc16_:int = int(_loc22_.length);
         var _loc29_:int = _loc11_;
         var _loc30_:int = _loc7_;
         var _loc19_:int = _loc28_ - _loc11_;
         if(!param4)
         {
            while(_loc22_.position < _loc16_)
            {
               _loc25_ = int(_loc22_.readUnsignedByte());
               _loc18_ = 1;
               if((_loc25_ & 0x80) == 128)
               {
                  _loc25_ &= 127;
                  _loc18_ = _loc22_.readUnsignedByte() + 1;
               }
               if(_loc25_ == 0)
               {
                  _loc29_ += _loc18_;
                  if(_loc29_ >= _loc28_)
                  {
                     _loc18_ = _loc29_ - _loc28_;
                     _loc29_ = _loc11_ + _loc18_ % _loc19_;
                     _loc30_ += _loc18_ / _loc19_ + 1;
                  }
               }
               else
               {
                  _loc13_ = uint(param3[_loc25_]);
                  if(_loc13_ >= 4278190080)
                  {
                     if(_loc29_ + _loc18_ < _loc28_)
                     {
                        while(--_loc18_ > -1)
                        {
                           _loc6_.setPixel32(_loc29_++,_loc30_,_loc13_);
                        }
                     }
                     else
                     {
                        while(--_loc18_ > -1)
                        {
                           _loc6_.setPixel32(_loc29_++,_loc30_,_loc13_);
                           if(_loc29_ == _loc28_)
                           {
                              _loc29_ = _loc11_;
                              _loc30_++;
                           }
                        }
                     }
                  }
                  else
                  {
                     while(--_loc18_ > -1)
                     {
                        _loc15_ = _loc6_.getPixel32(_loc29_,_loc30_);
                        if(_loc15_ != 0)
                        {
                           _loc26_ = _loc13_ >> 24 & 0xFF;
                           _loc31_ = _loc13_ >> 16 & 0xFF;
                           _loc20_ = _loc13_ >> 8 & 0xFF;
                           _loc8_ = _loc13_ & 0xFF;
                           _loc27_ = _loc15_ >> 24 & 0xFF;
                           _loc5_ = _loc15_ >> 16 & 0xFF;
                           _loc21_ = _loc15_ >> 8 & 0xFF;
                           _loc10_ = _loc15_ & 0xFF;
                           if(_loc26_ == 192)
                           {
                              _loc31_ = (_loc31_ + _loc31_ + _loc31_ + _loc5_) * 0.25;
                              _loc20_ = (_loc20_ + _loc20_ + _loc20_ + _loc21_) * 0.25;
                              _loc8_ = (_loc8_ + _loc8_ + _loc8_ + _loc10_) * 0.25;
                           }
                           else if(_loc26_ == 128)
                           {
                              _loc31_ = (_loc31_ + _loc5_) * 0.5;
                              _loc20_ = (_loc20_ + _loc21_) * 0.5;
                              _loc8_ = (_loc8_ + _loc10_) * 0.5;
                           }
                           else
                           {
                              _loc31_ = (_loc31_ + _loc5_ + _loc5_ + _loc5_) * 0.25;
                              _loc20_ = (_loc20_ + _loc21_ + _loc21_ + _loc21_) * 0.25;
                              _loc8_ = (_loc8_ + _loc10_ + _loc10_ + _loc10_) * 0.25;
                           }
                           if(_loc27_ > _loc26_)
                           {
                              _loc26_ = _loc27_;
                           }
                           _loc13_ = uint(_loc26_ << 24 | _loc31_ << 16 | _loc20_ << 8 | _loc8_);
                        }
                        _loc6_.setPixel32(_loc29_++,_loc30_,_loc13_);
                        if(_loc29_ == _loc28_)
                        {
                           _loc29_ = _loc11_;
                           _loc30_++;
                        }
                     }
                  }
               }
            }
         }
         else
         {
            _loc9_ = _bmax.x - _bmin.x;
            while(_loc22_.position < _loc16_)
            {
               _loc25_ = int(_loc22_.readUnsignedByte());
               _loc18_ = 1;
               if((_loc25_ & 0x80) == 128)
               {
                  _loc25_ &= 127;
                  _loc18_ = _loc22_.readUnsignedByte() + 1;
               }
               if(_loc25_ == 0)
               {
                  _loc29_ += _loc18_;
                  if(_loc29_ >= _loc28_)
                  {
                     _loc18_ = _loc29_ - _loc28_;
                     _loc29_ = _loc11_ + _loc18_ % _loc19_;
                     _loc30_ += _loc18_ / _loc19_ + 1;
                  }
               }
               else
               {
                  _loc13_ = uint(param3[_loc25_]);
                  if(_loc13_ >= 4278190080)
                  {
                     if(_loc29_ + _loc18_ < _loc28_)
                     {
                        while(--_loc18_ > -1)
                        {
                           _loc6_.setPixel32(_loc9_ - _loc29_++,_loc30_,_loc13_);
                        }
                     }
                     else
                     {
                        while(--_loc18_ > -1)
                        {
                           _loc6_.setPixel32(_loc9_ - _loc29_++,_loc30_,_loc13_);
                           if(_loc29_ == _loc28_)
                           {
                              _loc29_ = _loc11_;
                              _loc30_++;
                           }
                        }
                     }
                  }
                  else
                  {
                     while(--_loc18_ > -1)
                     {
                        _loc15_ = _loc6_.getPixel32(_loc9_ - _loc29_,_loc30_);
                        if(_loc15_ != 0)
                        {
                           _loc26_ = _loc13_ >> 24 & 0xFF;
                           _loc31_ = _loc13_ >> 16 & 0xFF;
                           _loc20_ = _loc13_ >> 8 & 0xFF;
                           _loc8_ = _loc13_ & 0xFF;
                           _loc27_ = _loc15_ >> 24 & 0xFF;
                           _loc5_ = _loc15_ >> 16 & 0xFF;
                           _loc21_ = _loc15_ >> 8 & 0xFF;
                           _loc10_ = _loc15_ & 0xFF;
                           switch(_loc26_)
                           {
                              case 192:
                                 _loc31_ = (_loc31_ + _loc31_ + _loc31_ + _loc5_) * 0.25;
                                 _loc20_ = (_loc20_ + _loc20_ + _loc20_ + _loc21_) * 0.25;
                                 _loc8_ = (_loc8_ + _loc8_ + _loc8_ + _loc10_) * 0.25;
                                 break;
                              case 128:
                                 _loc31_ = (_loc31_ + _loc5_) * 0.5;
                                 _loc20_ = (_loc20_ + _loc21_) * 0.5;
                                 _loc8_ = (_loc8_ + _loc10_) * 0.5;
                                 break;
                              case 64:
                                 _loc31_ = (_loc31_ + _loc5_ + _loc5_ + _loc5_) * 0.25;
                                 _loc20_ = (_loc20_ + _loc21_ + _loc21_ + _loc21_) * 0.25;
                                 _loc8_ = (_loc8_ + _loc10_ + _loc10_ + _loc10_) * 0.25;
                           }
                           if(_loc27_ > _loc26_)
                           {
                              _loc26_ = _loc27_;
                           }
                           _loc13_ = uint(_loc26_ << 24 | _loc31_ << 16 | _loc20_ << 8 | _loc8_);
                        }
                        _loc6_.setPixel32(_loc9_ - _loc29_++,_loc30_,_loc13_);
                        if(_loc29_ == _loc28_)
                        {
                           _loc29_ = _loc11_;
                           _loc30_++;
                        }
                     }
                  }
               }
            }
         }
         if(_loc24_.hasOwnProperty("s"))
         {
            _loc12_ = int(_loc24_.sm);
            _loc22_ = _loc24_.s;
            _loc16_ = int(_loc22_.length);
            _loc22_.position = 0;
            _loc29_ = _loc11_;
            _loc30_ = _loc7_;
            if(!param4)
            {
               while(_loc22_.position < _loc16_)
               {
                  _loc25_ = int(_loc22_.readUnsignedByte());
                  _loc18_ = 1;
                  if((_loc25_ & 0x80) == 128)
                  {
                     _loc25_ &= 127;
                     _loc18_ = _loc22_.readUnsignedByte() + 1;
                  }
                  if(_loc25_ == 0)
                  {
                     _loc29_ += _loc18_;
                     if(_loc29_ >= _loc28_)
                     {
                        _loc18_ = _loc29_ - _loc28_;
                        _loc29_ = _loc11_ + _loc18_ % _loc19_;
                        _loc30_ += _loc18_ / _loc19_ + 1;
                     }
                  }
                  else
                  {
                     _loc13_ = uint(_loc25_ << _loc12_);
                     _loc13_ = uint(_loc13_ + 24);
                     if(_loc13_ > 255)
                     {
                        _loc14_ = 1;
                     }
                     else
                     {
                        _loc14_ = _loc13_ / 255;
                     }
                     while(--_loc18_ > -1)
                     {
                        _loc15_ = _loc6_.getPixel32(_loc29_,_loc30_);
                        if(_loc15_ != 0)
                        {
                           _loc26_ = _loc15_ >> 24 & 0xFF;
                           _loc31_ = (_loc15_ >> 16 & 0xFF) * _loc14_;
                           _loc20_ = (_loc15_ >> 8 & 0xFF) * _loc14_;
                           _loc8_ = (_loc15_ & 0xFF) * _loc14_;
                           _loc23_ = uint(_loc26_ << 24 | _loc31_ << 16 | _loc20_ << 8 | _loc8_);
                           _loc6_.setPixel32(_loc29_,_loc30_,_loc23_);
                        }
                        if(++_loc29_ == _loc28_)
                        {
                           _loc29_ = _loc11_;
                           _loc30_++;
                        }
                     }
                  }
               }
            }
            else
            {
               _loc9_ = _bmax.x - _bmin.x;
               while(_loc22_.position < _loc16_)
               {
                  _loc25_ = int(_loc22_.readUnsignedByte());
                  _loc18_ = 1;
                  if((_loc25_ & 0x80) == 128)
                  {
                     _loc25_ &= 127;
                     _loc18_ = _loc22_.readUnsignedByte() + 1;
                  }
                  if(_loc25_ == 0)
                  {
                     _loc29_ += _loc18_;
                     if(_loc29_ >= _loc28_)
                     {
                        _loc18_ = _loc29_ - _loc28_;
                        _loc29_ = _loc11_ + _loc18_ % _loc19_;
                        _loc30_ += _loc18_ / _loc19_ + 1;
                     }
                  }
                  else
                  {
                     _loc13_ = uint(_loc25_ << _loc12_);
                     _loc13_ = uint(_loc13_ + 24);
                     if(_loc13_ > 255)
                     {
                        _loc14_ = 1;
                     }
                     else
                     {
                        _loc14_ = _loc13_ / 255;
                     }
                     while(--_loc18_ > -1)
                     {
                        _loc15_ = _loc6_.getPixel32(_loc9_ - _loc29_,_loc30_);
                        if(_loc15_ != 0)
                        {
                           _loc26_ = _loc15_ >> 24 & 0xFF;
                           _loc31_ = (_loc15_ >> 16 & 0xFF) * _loc14_;
                           _loc20_ = (_loc15_ >> 8 & 0xFF) * _loc14_;
                           _loc8_ = (_loc15_ & 0xFF) * _loc14_;
                           _loc23_ = uint(_loc26_ << 24 | _loc31_ << 16 | _loc20_ << 8 | _loc8_);
                           _loc6_.setPixel32(_loc9_ - _loc29_,_loc30_,_loc23_);
                        }
                        if(++_loc29_ == _loc28_)
                        {
                           _loc29_ = _loc11_;
                           _loc30_++;
                        }
                     }
                  }
               }
            }
         }
         _loc6_.unlock();
         return true;
      }
   }
}

