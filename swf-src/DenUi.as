package gui
{
   import flash.display.DisplayObjectContainer;
   import flash.display.Graphics;
   import flash.display.Shape;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.filters.DropShadowFilter;
   import flash.filters.GlowFilter;
   import flash.geom.Matrix;
   import flash.text.TextField;
   import flash.text.TextFormat;

   // the look of this server's den editor additions (the layers panel, the
   // pick bar, prefabs), drawn to match the game's own den editor
   // (HUDAssets' DenEditorAsset and DenAudioPopupSkin): a wooden frame, a
   // cream inside, a gold title strip, brown words in the game's font, and
   // the game's round blue buttons.
   public class DenUi
   {
      public static const WOOD:uint = 0x8C4E1D;
      public static const WOOD_LIGHT:uint = 0xA8652C;
      public static const WOOD_DARK:uint = 0x4B2709;
      public static const CREAM:uint = 0xE9D6A2;
      public static const CREAM_LIGHT:uint = 0xF6EBCB;
      public static const CREAM_DARK:uint = 0xD9C38A;
      public static const GOLD:uint = 0xF3D88C;
      public static const GOLD_DARK:uint = 0xC98A2A;
      public static const TEXT:uint = 0x5C3414;
      public static const TEXT_SOFT:uint = 0x8A6A45;
      public static const PICK:uint = 0xF6EC7C;
      public static const BLUE:uint = 0x3EA4F7;

      public function DenUi()
      {
         super();
      }

      // words in the game's font (AJClient.modText), brown unless said
      public static function text(param1:String, param2:int = 12, param3:uint = 0x5C3414, param4:Boolean = true) : TextField
      {
         return AJClient.modText(param1,param2,param3,param4);
      }

      // words that are cut short with "..." to fit `param2` pixels
      public static function fitText(param1:TextField, param2:String, param3:Number) : void
      {
         param1.text = param2;
         if(param1.width <= param3)
         {
            return;
         }
         var _loc4_:int = param2.length;
         while(_loc4_ > 1 && param1.width > param3)
         {
            _loc4_--;
            param1.text = param2.substr(0,_loc4_) + "...";
         }
      }

      // a white title outlined in brown, as the game's popups have
      public static function title(param1:String, param2:int = 15) : TextField
      {
         var _loc3_:TextField = text(param1,param2,0xFFFFFF);
         _loc3_.filters = [new GlowFilter(0x6D4330,1,4,4,12)];
         return _loc3_;
      }

      // the wooden frame with its cream inside (`param4` the inset)
      public static function woodBox(param1:Graphics, param2:Number, param3:Number, param4:Number = 7) : void
      {
         var _loc5_:Matrix = new Matrix();
         param1.beginFill(0,0.3);
         param1.drawRoundRect(2,4,param2,param3,22,22);
         param1.endFill();
         _loc5_.createGradientBox(param2,param3,Math.PI / 2);
         param1.lineStyle(2,WOOD_DARK);
         param1.beginGradientFill("linear",[WOOD_LIGHT,WOOD],[1,1],[0,255],_loc5_);
         param1.drawRoundRect(0,0,param2,param3,22,22);
         param1.endFill();
         param1.lineStyle(1,0x6A3812,0.6);
         param1.moveTo(8,param3 * 0.35);
         param1.curveTo(param2 * 0.25,param3 * 0.33,param2 * 0.4,param3 * 0.37);
         param1.moveTo(param2 * 0.6,param3 - 5);
         param1.curveTo(param2 * 0.75,param3 - 7,param2 - 10,param3 - 4);
         param1.lineStyle();
         creamBox(param1,param4,param4,param2 - param4 * 2,param3 - param4 * 2);
      }

      public static function creamBox(param1:Graphics, param2:Number, param3:Number, param4:Number, param5:Number) : void
      {
         var _loc6_:Matrix = new Matrix();
         _loc6_.createGradientBox(param4,param5,Math.PI / 2,param2,param3);
         param1.lineStyle(1.5,0x6A3812);
         param1.beginGradientFill("linear",[CREAM,0xE3DAB7],[1,1],[0,255],_loc6_);
         param1.drawRoundRect(param2,param3,param4,param5,16,16);
         param1.endFill();
         param1.lineStyle();
      }

      // the gold strip a popup's title sits on
      public static function titleStrip(param1:Graphics, param2:Number, param3:Number, param4:Number, param5:Number = 24) : void
      {
         var _loc6_:Matrix = new Matrix();
         _loc6_.createGradientBox(param4,param5,Math.PI / 2,param2,param3);
         param1.lineStyle(2,0x7A4A16);
         param1.beginGradientFill("linear",[0xF7E2A4,0xE2B65E],[1,1],[0,255],_loc6_);
         param1.drawRoundRect(param2,param3,param4,param5,param5,param5);
         param1.endFill();
         param1.lineStyle(1.5,GOLD_DARK);
         param1.drawRoundRect(param2 + 3,param3 + 3,param4 - 6,param5 - 6,param5 - 6,param5 - 6);
         param1.lineStyle();
      }

      // a pill button of the game's: a gradient from `param3` to `param4`,
      // a `param5` edge and a step of it underneath, white words
      public static function pill(param1:String, param2:Number, param3:uint, param4:uint, param5:uint, param6:Function, param7:Number = 26) : Sprite
      {
         var _loc8_:Sprite = new Sprite();
         _loc8_.buttonMode = true;
         _loc8_.useHandCursor = true;
         _loc8_.mouseChildren = false;
         drawPill(_loc8_.graphics,param2,param7,param3,param4,param5);
         var _loc9_:TextField = text(param1,param7 > 24 ? 13 : 12,0xFFFFFF);
         _loc9_.filters = [new DropShadowFilter(1.5,90,0,0.45,0,0,1)];
         _loc9_.x = int((param2 - _loc9_.width) * 0.5);
         _loc9_.y = int((param7 - _loc9_.height) * 0.5);
         _loc8_.addChild(_loc9_);
         if(param6 != null)
         {
            _loc8_.addEventListener("mouseDown",function(param1:MouseEvent):void
            {
               param1.stopPropagation();
               if(_loc8_.alpha >= 1)
               {
                  AJAudio.playSubMenuBtnClick();
                  param6();
               }
            },false,0,false);
         }
         _loc8_.addEventListener("mouseOver",onPillOver,false,0,true);
         _loc8_.addEventListener("mouseOut",onPillOver,false,0,true);
         return _loc8_;
      }

      public static function drawPill(param1:Graphics, param2:Number, param3:Number, param4:uint, param5:uint, param6:uint) : void
      {
         var _loc7_:Matrix = new Matrix();
         _loc7_.createGradientBox(param2,param3,Math.PI / 2);
         param1.clear();
         param1.beginFill(param6);
         param1.drawRoundRect(0,2,param2,param3,param3,param3);
         param1.endFill();
         param1.lineStyle(2,param6);
         param1.beginGradientFill("linear",[param4,param5],[1,1],[0,255],_loc7_);
         param1.drawRoundRect(0,0,param2,param3,param3,param3);
         param1.endFill();
         param1.lineStyle(2,0xFFFFFF,0.45);
         param1.moveTo(param3 * 0.45,3);
         param1.lineTo(param2 - param3 * 0.45,3);
         param1.lineStyle();
      }

      public static function greenPill(param1:String, param2:Number, param3:Function, param4:Number = 26) : Sprite
      {
         return pill(param1,param2,0xA6E05A,0x4FA52F,0x2F7420,param3,param4);
      }

      public static function redPill(param1:String, param2:Number, param3:Function, param4:Number = 26) : Sprite
      {
         return pill(param1,param2,0xF59A6A,0xD4482A,0x8E2B16,param3,param4);
      }

      public static function bluePill(param1:String, param2:Number, param3:Function, param4:Number = 26) : Sprite
      {
         return pill(param1,param2,0x8FD8FF,0x2F8FE0,0x1C5C9A,param3,param4);
      }

      public static function goldPill(param1:String, param2:Number, param3:Function, param4:Number = 26) : Sprite
      {
         return pill(param1,param2,0xFFD36B,0xE59A22,0x9A5C10,param3,param4);
      }

      // a button that does nothing now looks so
      public static function setEnabled(param1:Sprite, param2:Boolean) : void
      {
         param1.alpha = param2 ? 1 : 0.45;
         param1.buttonMode = param2;
      }

      private static function onPillOver(param1:MouseEvent) : void
      {
         var _loc2_:Sprite = Sprite(param1.currentTarget);
         if(_loc2_.alpha < 1)
         {
            return;
         }
         if(param1.type == "mouseOver")
         {
            _loc2_.filters = [new GlowFilter(0xFFFFFF,0.8,6,6,2)];
            AJAudio.playSubMenuBtnRollover();
         }
         else
         {
            _loc2_.filters = [];
         }
      }

      // the game's round blue button (as its close button), with a picture
      // drawn on it by `param2` (graphics, radius)
      public static function roundButton(param1:Number, param2:Function, param3:Function) : Sprite
      {
         var _loc4_:Sprite = new Sprite();
         var _loc5_:Matrix = new Matrix();
         _loc4_.buttonMode = true;
         _loc4_.useHandCursor = true;
         _loc4_.mouseChildren = false;
         _loc5_.createGradientBox(param1 * 2,param1 * 2,Math.PI / 2,-param1,-param1);
         _loc4_.graphics.beginFill(0x1C4F7A);
         _loc4_.graphics.drawCircle(0,0,param1 + 1.5);
         _loc4_.graphics.beginFill(0xFFFFFF);
         _loc4_.graphics.drawCircle(0,0,param1);
         _loc4_.graphics.beginGradientFill("linear",[0x8FD8FF,0x1D86D6],[1,1],[0,255],_loc5_);
         _loc4_.graphics.drawCircle(0,0,param1 - 2);
         _loc4_.graphics.endFill();
         if(param2 != null)
         {
            param2(_loc4_.graphics,param1);
         }
         if(param3 != null)
         {
            _loc4_.addEventListener("mouseDown",function(param1:MouseEvent):void
            {
               param1.stopPropagation();
               AJAudio.playSubMenuBtnClick();
               param3();
            },false,0,false);
         }
         _loc4_.addEventListener("mouseOver",onPillOver,false,0,true);
         _loc4_.addEventListener("mouseOut",onPillOver,false,0,true);
         return _loc4_;
      }

      public static function drawCross(param1:Graphics, param2:Number) : void
      {
         var _loc3_:Number = param2 * 0.36;
         param1.lineStyle(param2 * 0.22,0xFFFFFF);
         param1.moveTo(-_loc3_,-_loc3_);
         param1.lineTo(_loc3_,_loc3_);
         param1.moveTo(_loc3_,-_loc3_);
         param1.lineTo(-_loc3_,_loc3_);
         param1.lineStyle();
      }

      // a padlock, shut or open, `param4` its colour, `param2`,`param3` its middle
      public static function drawLock(param1:Graphics, param2:Number, param3:Number, param4:Boolean, param5:uint, param6:Number = 1) : void
      {
         param1.lineStyle(2 * param6,param5);
         if(param4)
         {
            param1.moveTo(param2 - 3.5 * param6,param3);
            param1.curveTo(param2 - 3.5 * param6,param3 - 6 * param6,param2,param3 - 6 * param6);
            param1.curveTo(param2 + 3.5 * param6,param3 - 6 * param6,param2 + 3.5 * param6,param3);
         }
         else
         {
            param1.moveTo(param2 - 3.5 * param6,param3);
            param1.curveTo(param2 - 3.5 * param6,param3 - 6 * param6,param2,param3 - 6 * param6);
            param1.curveTo(param2 + 3.5 * param6,param3 - 6 * param6,param2 + 3.5 * param6,param3 - 3 * param6);
         }
         param1.lineStyle(1,param5);
         param1.beginFill(param5);
         param1.drawRoundRect(param2 - 5 * param6,param3 - 0.5 * param6,10 * param6,7.5 * param6,3 * param6,3 * param6);
         param1.endFill();
         param1.lineStyle();
      }

      // the prefab tab's picture: three crates stacked, the top one gold
      public static function drawCrates(param1:Graphics, param2:Number, param3:Number, param4:Number = 1) : void
      {
         crate(param1,param2 - 9 * param4,param3 + 1 * param4,9 * param4,0xC98A4B);
         crate(param1,param2 + 1 * param4,param3 + 1 * param4,9 * param4,0xB5743A);
         crate(param1,param2 - 4 * param4,param3 - 8 * param4,9 * param4,0xF3C24E);
      }

      private static function crate(param1:Graphics, param2:Number, param3:Number, param4:Number, param5:uint) : void
      {
         param1.lineStyle(1.5,WOOD_DARK);
         param1.beginFill(param5);
         param1.drawRoundRect(param2,param3,param4,param4,2,2);
         param1.endFill();
         param1.lineStyle(1,WOOD_DARK,0.7);
         param1.moveTo(param2 + 1,param3 + 1);
         param1.lineTo(param2 + param4 - 1,param3 + param4 - 1);
         param1.lineStyle();
      }

      // a box over the whole game asking for a few words (or just saying
      // something, `param4` null): a title, a message, a field, and the
      // given buttons [label, colour "green"/"red"/"blue"/"gold", function
      // (typed text)]. Enter is the first button, Escape closes it. returns
      // its field (or null).
      public static function prompt(param1:DisplayObjectContainer, param2:String, param3:String, param4:String, param5:Array, param6:int = 30, param7:Boolean = false) : TextField
      {
         var _loc8_:Sprite = new Sprite();
         var _loc9_:Number = 340;
         var _loc10_:TextField = null;
         var _loc11_:TextField = null;
         var _loc12_:Number = 0;
         var _loc13_:Sprite = null;
         var _loc14_:Number = 0;
         var _loc15_:Array = null;
         var _loc16_:Function = null;
         _loc8_.graphics.beginFill(0,0.35);
         _loc8_.graphics.drawRect(0,0,900,550);
         _loc8_.graphics.endFill();
         var _loc17_:Sprite = new Sprite();
         _loc8_.addChild(_loc17_);
         _loc10_ = text(param3,12,TEXT,false);
         _loc10_.wordWrap = true;
         _loc10_.multiline = true;
         _loc10_.autoSize = "left";
         _loc10_.width = _loc9_ - 44;
         _loc10_.text = param3;
         var _loc18_:Number = 46 + _loc10_.height + (param4 != null ? 40 : 0) + 50;
         woodBox(_loc17_.graphics,_loc9_,_loc18_);
         titleStrip(_loc17_.graphics,14,10,_loc9_ - 28,26);
         var _loc19_:TextField = title(param2,14);
         _loc19_.x = int((_loc9_ - _loc19_.width) * 0.5);
         _loc19_.y = 13;
         _loc17_.addChild(_loc19_);
         _loc10_.x = 22;
         _loc10_.y = 44;
         _loc17_.addChild(_loc10_);
         _loc12_ = _loc10_.y + _loc10_.height + 8;
         if(param4 != null)
         {
            var _loc20_:Shape = new Shape();
            _loc20_.graphics.lineStyle(2,0xC9A86A);
            _loc20_.graphics.beginFill(0xFFFFFF);
            _loc20_.graphics.drawRoundRect(22,_loc12_,_loc9_ - 44,28,16,16);
            _loc20_.graphics.endFill();
            _loc17_.addChild(_loc20_);
            _loc11_ = new TextField();
            _loc11_.type = param7 ? "dynamic" : "input";
            _loc11_.selectable = true;
            _loc11_.maxChars = param6;
            _loc11_.embedFonts = AJClient.hasGameFont();
            _loc11_.defaultTextFormat = new TextFormat(_loc11_.embedFonts ? "CCDigitalDelivery" : "Arial",14,TEXT,true);
            _loc11_.text = param4;
            _loc11_.x = 32;
            _loc11_.y = _loc12_ + 4;
            _loc11_.width = _loc9_ - 64;
            _loc11_.height = 22;
            _loc17_.addChild(_loc11_);
            _loc12_ += 38;
         }
         _loc14_ = (_loc9_ - 32 - (param5.length - 1) * 10) / param5.length;
         var _loc21_:Function = function():void
         {
            if(_loc8_.parent)
            {
               _loc8_.parent.removeChild(_loc8_);
            }
            if(_loc11_)
            {
               _loc11_.removeEventListener("keyDown",onKey);
            }
            if(_loc11_ && gMainFrame.stage.focus == _loc11_)
            {
               gMainFrame.stage.focus = null;
            }
         };
         var _loc22_:Array = [];
         for each(_loc15_ in param5)
         {
            _loc16_ = _loc15_[2];
            _loc13_ = pressButton(_loc15_[0],_loc14_,_loc15_[1],_loc16_,_loc21_,_loc11_);
            _loc13_.x = 16 + _loc22_.length * (_loc14_ + 10);
            _loc13_.y = _loc18_ - 42;
            _loc17_.addChild(_loc13_);
            _loc22_.push(_loc15_);
         }
         var onKey:Function = function(param1:KeyboardEvent):void
         {
            param1.stopPropagation();
            if(param1.keyCode == 13 && _loc22_.length > 0)
            {
               _loc21_();
               if(_loc22_[0][2] != null)
               {
                  _loc22_[0][2](_loc11_ ? _loc11_.text : "");
               }
            }
            else if(param1.keyCode == 27)
            {
               _loc21_();
            }
         };
         if(_loc11_)
         {
            _loc11_.addEventListener("keyDown",onKey,false,0,false);
         }
         _loc17_.x = int((900 - _loc9_) * 0.5);
         _loc17_.y = int((550 - _loc18_) * 0.45);
         // a click past the box does nothing in the room
         _loc8_.addEventListener("mouseDown",stop,false,0,true);
         _loc8_.addEventListener("mouseMove",stop,false,0,true);
         _loc8_.addEventListener("click",stop,false,0,true);
         param1.addChild(_loc8_);
         if(_loc11_)
         {
            gMainFrame.stage.focus = _loc11_;
            _loc11_.setSelection(0,_loc11_.length);
         }
         return _loc11_;
      }

      private static function pressButton(param1:String, param2:Number, param3:String, param4:Function, param5:Function, param6:TextField) : Sprite
      {
         var _loc7_:Function = function():void
         {
            param5();
            if(param4 != null)
            {
               param4(param6 ? param6.text : "");
            }
         };
         switch(param3)
         {
            case "red":
               return redPill(param1,param2,_loc7_,30);
            case "blue":
               return bluePill(param1,param2,_loc7_,30);
            case "gold":
               return goldPill(param1,param2,_loc7_,30);
            default:
               return greenPill(param1,param2,_loc7_,30);
         }
      }

      public static function stop(param1:Event) : void
      {
         param1.stopPropagation();
      }
   }
}
