package gui
{
   import avatar.AvatarView;
   import com.sbi.popup.SBOkPopup;
   import den.DenStateItem;
   import den.DenXtCommManager;
   import flash.display.BitmapData;
   import flash.display.DisplayObject;
   import flash.display.DisplayObjectContainer;
   import flash.display.Graphics;
   import flash.display.Shape;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.IOErrorEvent;
   import flash.events.MouseEvent;
   import flash.filters.GlowFilter;
   import flash.geom.Matrix;
   import flash.geom.Rectangle;
   import flash.net.FileFilter;
   import flash.net.FileReference;
   import flash.system.System;
   import flash.utils.ByteArray;
   import flash.utils.Dictionary;
   import room.DenItemHolder;
   import room.LayerManager;
   import room.RoomManagerWorld;

   // the whole den, from buttons by the den editor's Shop button (this server): a
   // picture of it saved to a file, and its layout shared as a file or a
   // code and laid out again from one. the server's side is
   // lib/denlayouts.js and the "dl*" messages in lib/dens.js.
   public class DenShare
   {
      // a picture is no bigger than this a side, nor than MAX_PIXELS in all
      // (AJClient.encodePng goes pixel by pixel, in the click)
      private static const MAX_SIDE:int = 2400;
      private static const MAX_PIXELS:int = 2000000;
      private static const FORMAT:String = "den-layout";
      private static const MAX_ITEMS:int = 1500;

      private var _layer:DisplayObjectContainer;
      private var _holder:DenItemHolder;
      // kept, or it can go before its dialog is done with
      private var _file:FileReference;
      // the last "dlx": {den, sig, rows}
      private var _export:Object;
      private var _exportWanted:Boolean;

      public function DenShare(param1:DisplayObjectContainer, param2:DenItemHolder)
      {
         super();
         _layer = param1;
         _holder = param2;
      }

      private function say(param1:String) : void
      {
         new SBOkPopup(_layer,param1);
      }

      // ---- the buttons (gui.DenEditor puts them by the Shop button) ----

      // a row of three: a picture of the den, its layout shared, a layout
      // loaded
      public function makeButtons() : Sprite
      {
         var _loc1_:Sprite = new Sprite();
         var _loc2_:Array = [["picture","Save a picture of your den",picture],["share","Share your den's layout",exportDen],["load","Load a den layout",importDen]];
         var _loc3_:int = 0;
         while(_loc3_ < _loc2_.length)
         {
            var _loc4_:Sprite = button(_loc1_,_loc2_[_loc3_][0],_loc2_[_loc3_][1],_loc2_[_loc3_][2]);
            _loc4_.x = _loc3_ * 42;
            _loc1_.addChild(_loc4_);
            _loc3_++;
         }
         return _loc1_;
      }

      private function button(param1:Sprite, param2:String, param3:String, param4:Function) : Sprite
      {
         var _loc5_:Sprite = new Sprite();
         _loc5_.buttonMode = true;
         _loc5_.mouseChildren = false;
         DenUi.woodBox(_loc5_.graphics,36,36,4);
         var _loc6_:Shape = new Shape();
         _loc6_.x = 18;
         _loc6_.y = 18;
         if(param2 == "picture")
         {
            drawCamera(_loc6_.graphics);
         }
         else
         {
            DenUi.drawCrates(_loc6_.graphics,-2,1,1.2);
            drawArrow(_loc6_.graphics,8,-8,param2 == "share");
         }
         _loc5_.addChild(_loc6_);
         // mouseDown, as a file dialog can only be opened from a click
         _loc5_.addEventListener("mouseDown",function(param1:MouseEvent):void
         {
            param1.stopPropagation();
            AJAudio.playSubMenuBtnClick();
            GuiManager.toolTip.resetTimerAndSetVisibility();
            param4();
         },false,0,false);
         _loc5_.addEventListener("mouseOver",function(param2:MouseEvent):void
         {
            param2.stopPropagation();
            _loc5_.filters = [new GlowFilter(0xFFFFFF,0.8,8,8,2)];
            AJAudio.playSubMenuBtnRollover();
            GuiManager.toolTip.init(_layer,param3,param1.x + _loc5_.x + 18,param1.y + _loc5_.y + 36 + 22);
            GuiManager.toolTip.startTimer(param2);
         },false,0,false);
         _loc5_.addEventListener("mouseOut",function(param2:MouseEvent):void
         {
            _loc5_.filters = [];
            GuiManager.toolTip.resetTimerAndSetVisibility();
         },false,0,false);
         return _loc5_;
      }

      // a camera
      private static function drawCamera(param1:Graphics) : void
      {
         param1.lineStyle(1.5,0x3A2A20);
         param1.beginFill(0x6D7B8A);
         param1.drawRoundRect(-12,-6,24,17,5,5);
         param1.endFill();
         param1.beginFill(0x6D7B8A);
         param1.drawRoundRect(-5,-10,10,5,2,2);
         param1.endFill();
         param1.beginFill(0xDDEEFF);
         param1.drawCircle(0,2.5,6);
         param1.endFill();
         param1.lineStyle();
         param1.beginFill(0x2C4A6A);
         param1.drawCircle(0,2.5,3.2);
         param1.endFill();
         param1.beginFill(0xFFD54A);
         param1.drawCircle(8,-2.5,1.6);
         param1.endFill();
      }

      // a round badge with an arrow: up (out of the den) or down (into it)
      private static function drawArrow(param1:Graphics, param2:Number, param3:Number, param4:Boolean) : void
      {
         param1.lineStyle(1.5,param4 ? 0x1F5C8C : 0x2F7420);
         param1.beginFill(param4 ? 0x3C8DD0 : 0x4FA52F);
         param1.drawCircle(param2,param3,6.5);
         param1.endFill();
         param1.lineStyle(2.2,0xFFFFFF);
         var _loc5_:Number = param4 ? -1 : 1;
         param1.moveTo(param2,param3 - 3.5 * _loc5_);
         param1.lineTo(param2,param3 + 3.5 * _loc5_);
         param1.moveTo(param2 - 3,param3 + 0.5 * _loc5_);
         param1.lineTo(param2,param3 + 3.5 * _loc5_);
         param1.lineTo(param2 + 3,param3 + 0.5 * _loc5_);
         param1.lineStyle();
      }

      // ---- the picture ----

      // the den drawn whole, its players left out, and saved where the
      // player says. called from a click (a file can only be saved then).
      public function picture() : void
      {
         var _loc1_:ByteArray = null;
         try
         {
            _loc1_ = drawDen();
         }
         catch(e:Error)
         {
            _loc1_ = null;
         }
         if(_loc1_ == null)
         {
            say("Your den could not be drawn. Try again in a moment.");
            return;
         }
         try
         {
            _file = new FileReference();
            _file.save(_loc1_,"my-den.png");
         }
         catch(e:Error)
         {
            say("The picture could not be saved: " + e.message);
         }
      }

      // a PNG of the den: its room and every item in it, at its own size (or
      // smaller, to fit MAX_SIDE), without players, pets that walk with them,
      // names, chat or the editor's buttons
      private function drawDen() : ByteArray
      {
         var _loc1_:LayerManager = RoomManagerWorld.instance.layerManager;
         var _loc2_:DisplayObjectContainer = _loc1_.bkg;
         var _loc3_:Dictionary = new Dictionary(true);
         var _loc4_:Array = [];
         var _loc5_:Array = [];
         var _loc6_:Rectangle = null;
         var _loc7_:DisplayObject = null;
         var _loc8_:BitmapData = null;
         for each(var _loc9_:DenStateItem in _holder.placedItems)
         {
            if(_loc9_.denItemHelper && _loc9_.denItemHelper.displayObject)
            {
               _loc3_[_loc9_.denItemHelper.displayObject] = true;
            }
         }
         var hide:Function = function(param1:DisplayObject):void
         {
            if(param1 && param1.visible)
            {
               _loc4_.push(param1);
               param1.visible = false;
            }
         };
         try
         {
            for each(_loc7_ in [_loc1_.room_chat,_loc1_.room_orbs,_loc1_.flying_avatars,_loc1_.preview_room_avatar,_loc1_.preview_room_flying_avatar])
            {
               hide(_loc7_);
            }
            var _loc10_:int = 0;
            while(_loc10_ < _loc1_.room_avatars.numChildren)
            {
               _loc7_ = _loc1_.room_avatars.getChildAt(_loc10_);
               if(!_loc3_[_loc7_] && _loc7_ is AvatarView)
               {
                  hide(_loc7_);
               }
               _loc10_++;
            }
            // the editor's glow on the item under the mouse
            for(var _loc11_:* in _loc3_)
            {
               _loc7_ = DisplayObject(_loc11_);
               if(_loc7_.filters && _loc7_.filters.length > 0)
               {
                  _loc5_.push([_loc7_,_loc7_.filters]);
                  _loc7_.filters = [];
               }
            }
            // the room's own art, and every item, wherever it stands
            for each(_loc7_ in [_loc1_.room_bkg,_loc1_.room_fg,_loc1_.room_super_fg])
            {
               if(_loc7_ && _loc7_.visible)
               {
                  _loc6_ = union(_loc6_,_loc7_.getBounds(_loc2_));
               }
            }
            for(_loc11_ in _loc3_)
            {
               _loc6_ = union(_loc6_,DisplayObject(_loc11_).getBounds(_loc2_));
            }
            if(_loc6_ != null && _loc6_.width >= 1 && _loc6_.height >= 1)
            {
               var _loc12_:Number = Math.min(1,MAX_SIDE / _loc6_.width,MAX_SIDE / _loc6_.height,Math.sqrt(MAX_PIXELS / (_loc6_.width * _loc6_.height)));
               var _loc13_:int = Math.max(1,Math.ceil(_loc6_.width * _loc12_));
               var _loc14_:int = Math.max(1,Math.ceil(_loc6_.height * _loc12_));
               _loc8_ = new BitmapData(_loc13_,_loc14_,true,0);
               _loc8_.draw(_loc2_,new Matrix(_loc12_,0,0,_loc12_,-_loc6_.x * _loc12_,-_loc6_.y * _loc12_),null,null,null,true);
            }
         }
         finally
         {
            for each(_loc7_ in _loc4_)
            {
               _loc7_.visible = true;
            }
            for each(var _loc15_:Array in _loc5_)
            {
               DisplayObject(_loc15_[0]).filters = _loc15_[1];
            }
         }
         if(_loc8_ == null)
         {
            return null;
         }
         var _loc16_:ByteArray = AJClient.encodePng(_loc8_);
         _loc8_.dispose();
         return _loc16_;
      }

      private static function union(param1:Rectangle, param2:Rectangle) : Rectangle
      {
         if(param2 == null || param2.width <= 0 || param2.height <= 0)
         {
            return param1;
         }
         return param1 == null ? param2 : param1.union(param2);
      }

      // ---- sharing the layout ----

      // the den as the server has it, then: a file, or a code
      public function exportDen() : void
      {
         saveEdits();
         _exportWanted = true;
         DenXtCommManager.requestLayoutExport();
      }

      // what was changed in the editor is only sent when it closes: sent now
      // (a "ds", before the layout is asked for), so the server shares the
      // den as it looks
      private function saveEdits() : void
      {
         try
         {
            _holder.saveState();
         }
         catch(e:Error)
         {
         }
      }

      private function exportChoice() : void
      {
         DenUi.prompt(_layer,"Share your den","Save your den's layout as a file to send to anyone, or get a code they can type in. Either way they can lay out their own den the same (it must be the same kind of den).",null,[["Save file","green",function(param1:String):void
         {
            saveFile();
         }],["Get code","blue",function(param1:String):void
         {
            askShareName();
         }],["Cancel","red",null]]);
      }

      // the file: what this server can read again, with its signature
      // (lib/denlayouts.js): a file changed by hand still lays out, but
      // gives nothing. called from a click.
      private function saveFile() : void
      {
         if(_export == null)
         {
            return;
         }
         var _loc1_:Object = {
            "format":FORMAT,
            "version":1,
            "den":_export.den,
            "sig":_export.sig,
            "items":_export.rows
         };
         try
         {
            _file = new FileReference();
            _file.save(JSON.stringify(_loc1_),"my-den.json");
         }
         catch(e:Error)
         {
            say("The file could not be saved: " + e.message);
         }
      }

      private function askShareName() : void
      {
         DenUi.prompt(_layer,"Get a code","Name this layout. The code keeps it as your den is now; your 20 newest codes keep working.","My den",[["Get code","green",function(param1:String):void
         {
            var _loc2_:String = param1.replace(/^\s+|\s+$/g,"");
            saveEdits();
            DenXtCommManager.requestLayoutShare(_loc2_ == "" ? "My den" : _loc2_);
         }],["Cancel","red",null]],30);
      }

      private function showCode(param1:String) : void
      {
         var _loc2_:String = param1.length == 8 ? param1.substr(0,4) + "-" + param1.substr(4) : param1;
         DenUi.prompt(_layer,"Share your den","Anyone who types this code in their den editor (the Load button by Shop, then Enter code) can lay out their den like yours.",_loc2_,[["Copy","blue",function(param1:String):void
         {
            System.setClipboard(_loc2_);
         }],["Done","green",null]],12,true);
      }

      // ---- laying a layout out ----

      public function importDen() : void
      {
         DenUi.prompt(_layer,"Load a den layout","Lay your den out from a file someone sent you, or from a code. What is in your den now goes back to your items, and !den undo puts it back.",null,[["Open file","green",function(param1:String):void
         {
            openFile();
         }],["Enter code","blue",function(param1:String):void
         {
            askCode();
         }],["Cancel","red",null]]);
      }

      private function askCode() : void
      {
         DenUi.prompt(_layer,"Enter code","Type the code of a den layout someone shared.","",[["Look at it","green",function(param1:String):void
         {
            var _loc2_:String = param1.replace(/[\s-]/g,"");
            if(_loc2_ != "")
            {
               DenXtCommManager.requestLayoutCode(_loc2_);
            }
         }],["Cancel","red",null]],12);
      }

      // called from a click (a file can only be chosen then)
      private function openFile() : void
      {
         try
         {
            _file = new FileReference();
            _file.addEventListener("select",onFileSelect,false,0,false);
            _file.addEventListener("complete",onFileLoaded,false,0,false);
            _file.addEventListener("ioError",onFileError,false,0,false);
            _file.browse([new FileFilter("Den layouts (*.json)","*.json;*.JSON")]);
         }
         catch(e:Error)
         {
            say("Files cannot be opened here: " + e.message);
         }
      }

      private function onFileSelect(param1:Event) : void
      {
         try
         {
            _file.load();
         }
         catch(e:Error)
         {
            say("That file could not be read: " + e.message);
         }
      }

      private function onFileError(param1:IOErrorEvent) : void
      {
         say("That file could not be read.");
      }

      private function onFileLoaded(param1:Event) : void
      {
         var _loc2_:Object = null;
         var _loc3_:Array = [];
         try
         {
            var _loc4_:ByteArray = _file.data;
            _loc4_.position = 0;
            _loc2_ = JSON.parse(_loc4_.readUTFBytes(_loc4_.length));
            if(_loc2_ == null || _loc2_.format != FORMAT || !(_loc2_.items is Array) || _loc2_.items.length == 0 || _loc2_.items.length > MAX_ITEMS)
            {
               throw new Error("not a layout");
            }
            for each(var _loc5_:* in _loc2_.items)
            {
               if(!(_loc5_ is Array) || _loc5_.length != 6)
               {
                  throw new Error("not a layout");
               }
               _loc3_.push([int(_loc5_[0]),int(_loc5_[1]),int(_loc5_[2]),int(_loc5_[3]),int(_loc5_[4]),int(_loc5_[5])]);
            }
         }
         catch(e:Error)
         {
            say("That file is not a den layout. Choose one saved with the Share button's Save file.");
            return;
         }
         DenXtCommManager.requestLayoutFile(int(_loc2_.den),String(_loc2_.sig == null ? "" : _loc2_.sig),_loc3_);
      }

      // what the layout takes, from the server: then yes or no
      private function confirm(param1:int, param2:int, param3:int, param4:int, param5:Boolean, param6:String) : void
      {
         var _loc7_:String = (param6 != "" ? "\"" + param6 + "\" has " : "This layout has ") + param1 + (param1 == 1 ? " item. " : " items. ");
         _loc7_ += param2 == param1 ? "You have them all." : "You have " + param2 + " of them.";
         if(param3 > 0)
         {
            _loc7_ += " " + param3 + (param3 == 1 ? " you don't have is" : " you don't have are") + " given to you free.";
         }
         if(param4 > 0)
         {
            _loc7_ += param5 ? " " + param4 + " can't be placed." : " " + param4 + " you don't have can't be placed: the file was changed after it was saved, so nothing is given.";
         }
         _loc7_ += "\n\nWhat is in your den now goes back to your items (!den undo puts it back).";
         DenUi.prompt(_layer,"Lay out your den",_loc7_,null,[["Lay it out","green",function(param1:String):void
         {
            apply();
         }],["Cancel","red",null]]);
      }

      // the editor closed first, which sends what was changed in it; the
      // layout then comes after, and the den reloads
      private function apply() : void
      {
         try
         {
            if(GuiManager.denEditor)
            {
               GuiManager.denEditor.closeDenCustomization();
            }
         }
         catch(e:Error)
         {
         }
         DenXtCommManager.requestLayoutApply();
      }

      // ---- the server's answers ("dlx", "dlc", "dli", "dla") ----

      public function onReply(param1:Object) : void
      {
         var _loc2_:Boolean = String(param1[2]) == "1";
         if(!_loc2_)
         {
            _exportWanted = false;
            say(String(param1[3]));
            return;
         }
         switch(String(param1[0]))
         {
            case "dlx":
               var _loc3_:int = int(param1[5]);
               var _loc4_:Array = [];
               var _loc5_:int = 0;
               while(_loc5_ < _loc3_)
               {
                  var _loc6_:int = 6 + _loc5_ * 6;
                  _loc4_.push([int(param1[_loc6_]),int(param1[_loc6_ + 1]),int(param1[_loc6_ + 2]),int(param1[_loc6_ + 3]),int(param1[_loc6_ + 4]),int(param1[_loc6_ + 5])]);
                  _loc5_++;
               }
               _export = {
                  "den":int(param1[3]),
                  "sig":String(param1[4]),
                  "rows":_loc4_
               };
               if(_exportWanted)
               {
                  _exportWanted = false;
                  exportChoice();
               }
               break;
            case "dlc":
               showCode(String(param1[3]));
               break;
            case "dli":
               confirm(int(param1[3]),int(param1[4]),int(param1[5]),int(param1[6]),String(param1[7]) == "1",String(param1[8] == null ? "" : param1[8]));
               break;
            case "dla":
               say(int(param1[4]) > 0 ? "Your den is laid out, apart from " + int(param1[4]) + (int(param1[4]) == 1 ? " item." : " items.") + " Type !den undo to put it back as it was." : "Your den is laid out. Type !den undo to put it back as it was.");
         }
      }
   }
}
