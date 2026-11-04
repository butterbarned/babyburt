package gui
{
   import avatar.AvatarManager;
   import collection.DenItemCollection;
   import com.sbi.popup.SBOkPopup;
   import com.sbi.popup.SBYesNoPopup;
   import den.DenItem;
   import den.DenStateItem;
   import den.DenXtCommManager;
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.display.DisplayObject;
   import flash.display.DisplayObjectContainer;
   import flash.display.Graphics;
   import flash.display.Loader;
   import flash.display.MovieClip;
   import flash.display.Shape;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.IOErrorEvent;
   import flash.events.KeyboardEvent;
   import flash.events.MouseEvent;
   import flash.filters.GlowFilter;
   import flash.geom.ColorTransform;
   import flash.geom.Matrix;
   import flash.geom.Point;
   import flash.geom.Rectangle;
   import flash.net.SharedObject;
   import flash.net.URLRequest;
   import flash.system.System;
   import flash.text.TextField;
   import flash.text.TextFormat;
   import flash.events.TimerEvent;
   import flash.utils.ByteArray;
   import flash.utils.Timer;
   import room.DenItemHolder;
   import room.RoomManagerWorld;
   import shop.ShopManager;

   // the den editor's prefab tab (this server): items laid out together,
   // saved from the den (the pick bar's "Save prefab", or this tab's first
   // tile), and put down again as one group in the middle of the screen. what
   // the player has none of free is added to their den items first, free,
   // when they say yes. a prefab can be shared by its code, and another's
   // code copies theirs. the server's side is lib/denprefabs.js.
   public class DenPrefabs
   {
      private static const PAGE:int = 10;
      private static const MAX_PLACED:int = 1000;
      private static const THUMB_W:int = 96;
      private static const THUMB_H:int = 72;

      private var _layer:DisplayObjectContainer;
      private var _holder:DenItemHolder;
      private var _place:Function;
      private var _block:MovieClip;
      private var _strip:Sprite;
      private var _tabDn:MovieClip;
      private var _tabUp:MovieClip;
      private var _open:Boolean;
      private var _prefabs:Array;
      private var _filter:String = "";
      private var _page:int;
      private var _waiting:Object;
      private var _pictures:Object;
      private var _countTxt:TextField;
      // what each prefab put down in the den: prefab id -> den item inventory
      // ids, kept between visits (SharedObject "denPrefabs")
      private var _inDen:Object;
      // the open details box: its prefab and its code field
      private var _details:Sprite;
      private var _detailsId:String;
      private var _detailsCode:TextField;

      // param4: places [[DenItem, x, y, flip]...] in the den (gui.DenEditor)
      public function DenPrefabs(param1:DisplayObjectContainer, param2:DenItemHolder, param3:MovieClip, param4:Function)
      {
         super();
         _layer = param1;
         _holder = param2;
         _block = param3;
         _place = param4;
         _prefabs = [];
         _pictures = {};
         _waiting = {};
         _strip = new Sprite();
         _inDen = {};
         try
         {
            var _loc5_:Object = SharedObject.getLocal("denPrefabs").data.inDen;
            if(_loc5_ != null)
            {
               _inDen = _loc5_;
            }
         }
         catch(e:Error)
         {
         }
      }

      public function destroy() : void
      {
         for each(var _loc1_:MovieClip in [_tabDn,_tabUp])
         {
            if(_loc1_ && _loc1_.parent)
            {
               _loc1_.parent.removeChild(_loc1_);
            }
         }
         try
         {
            close();
         }
         catch(e:Error)
         {
         }
         try
         {
            closeDetails();
         }
         catch(e:Error)
         {
         }
      }

      public function get isOpen() : Boolean
      {
         return _open;
      }

      // ---- the tab ----

      // the tab: a copy of the game's own (the pet tab's art), its picture
      // three crates. `param1` the unselected one, `param2` the selected.
      public function makeTabs(param1:MovieClip, param2:MovieClip, param3:Function, param4:Function, param5:Function) : void
      {
         try
         {
            _tabDn = GETDEFINITIONBYNAME("petBtnDown_icon");
            _tabUp = GETDEFINITIONBYNAME("petBtnDown_icon");
         }
         catch(e:Error)
         {
            _tabDn = new MovieClip();
            _tabUp = new MovieClip();
            DenUi.woodBox(_tabDn.graphics,40,34,3);
            DenUi.woodBox(_tabUp.graphics,40,34,3);
         }
         crateIcon(_tabDn,false);
         crateIcon(_tabUp,true);
         _tabDn.transform.matrix = param1.transform.matrix;
         _tabUp.transform.matrix = param1.transform.matrix;
         _tabUp.mouseEnabled = false;
         _tabUp.mouseChildren = false;
         _tabUp.visible = false;
         // at the game's own tabs' depth: an unselected tab sits behind the
         // item window, the selected one in front of it
         param1.parent.addChildAt(_tabDn,param1.parent.getChildIndex(param1) + 1);
         param2.parent.addChildAt(_tabUp,param2.parent.getChildIndex(param2) + 1);
         _tabDn.buttonMode = true;
         _tabDn.addEventListener("mouseDown",param3,false,0,true);
         _tabDn.addEventListener("mouseOver",param4,false,0,true);
         _tabDn.addEventListener("mouseOut",param5,false,0,true);
      }

      public function get tabDn() : MovieClip
      {
         return _tabDn;
      }

      public function get tabUp() : MovieClip
      {
         return _tabUp;
      }

      // the tab's butterfly swapped for crates; the selected one cream, as
      // the game's selected tabs are
      private function crateIcon(param1:DisplayObjectContainer, param2:Boolean) : void
      {
         var _loc3_:int = 0;
         var _loc4_:DisplayObject = null;
         var _loc5_:DisplayObjectContainer = null;
         if(param1.numChildren == 3 && param1.getChildAt(2) is DisplayObjectContainer && !(param1.getChildAt(2) is MovieClip && MovieClip(param1.getChildAt(2)).totalFrames > 1))
         {
            _loc4_ = param1.getChildAt(2);
            var _loc6_:Rectangle = _loc4_.getBounds(param1);
            _loc4_.visible = false;
            var _loc7_:Shape = new Shape();
            DenUi.drawCrates(_loc7_.graphics,0,0,1.25);
            _loc7_.x = _loc6_.x + _loc6_.width * 0.5;
            _loc7_.y = _loc6_.y + _loc6_.height * 0.5 + 1;
            param1.addChild(_loc7_);
            if(param2)
            {
               param1.getChildAt(1).transform.colorTransform = new ColorTransform(0,0,0,1,0xEA,0xDC,0xB0,0);
            }
            return;
         }
         _loc3_ = 0;
         while(_loc3_ < param1.numChildren)
         {
            _loc5_ = param1.getChildAt(_loc3_) as DisplayObjectContainer;
            if(_loc5_ != null)
            {
               crateIcon(_loc5_,param2);
            }
            _loc3_++;
         }
      }

      // ---- the strip of tiles ----

      public function open(param1:TextField) : void
      {
         _open = true;
         _countTxt = param1;
         _tabUp.visible = true;
         _page = 0;
         _filter = "";
         draw();
         DenXtCommManager.requestPrefabList();
      }

      public function close() : void
      {
         _open = false;
         closeDetails();
         if(_tabUp)
         {
            _tabUp.visible = false;
         }
         if(_strip.parent)
         {
            _strip.parent.removeChild(_strip);
         }
      }

      public function search(param1:String) : void
      {
         _filter = param1.toLowerCase();
         _page = 0;
         draw();
      }

      public function scroll(param1:Boolean) : void
      {
         var _loc2_:int = Math.max(0,Math.ceil((shown().length + 2) / PAGE) - 1);
         _page = Math.max(0,Math.min(_loc2_,_page + (param1 ? -1 : 1)));
         draw();
      }

      private function shown() : Array
      {
         if(_filter == "")
         {
            return _prefabs;
         }
         return _prefabs.filter(function(param1:Object, param2:int, param3:Array):Boolean
         {
            return String(param1.name).toLowerCase().indexOf(_filter) >= 0;
         });
      }

      private function draw() : void
      {
         if(!_open)
         {
            return;
         }
         while(_strip.numChildren > 0)
         {
            _strip.removeChildAt(0);
         }
         if(_strip.parent != _block)
         {
            _block.addChild(_strip);
         }
         if(_countTxt)
         {
            _countTxt.text = _prefabs.length + "/50";
         }
         var _loc1_:Array = [{"kind":"new"},{"kind":"code"}];
         for each(var _loc2_:Object in shown())
         {
            _loc1_.push(_loc2_);
         }
         var _loc3_:Number = _block.getChildAt(0).width / PAGE;
         var _loc4_:Number = _block.getChildAt(0).height;
         var _loc5_:int = 0;
         var _loc6_:int = _page * PAGE;
         while(_loc6_ < Math.min(_loc1_.length,_page * PAGE + PAGE))
         {
            var _loc7_:Sprite = tile(_loc1_[_loc6_],_loc3_,_loc4_);
            _loc7_.x = _loc5_ * _loc3_;
            _strip.addChild(_loc7_);
            _loc5_++;
            _loc6_++;
         }
      }

      // one tile, in the game's item window art when it can be had
      private function tile(param1:Object, param2:Number, param3:Number) : Sprite
      {
         var _loc4_:Sprite = new Sprite();
         var _loc5_:MovieClip = null;
         var _loc6_:Rectangle = null;
         var _loc7_:Number = Math.min(param2,param3) - 8;
         try
         {
            _loc5_ = GETDEFINITIONBYNAME("itemWindow");
            for each(var _loc8_:String in ["lock","lockOpen","gray","gift","addBtn","removeBtn","ocean","rare","avtSpecific","avtSpecificIcon","avtSpecificHighlight","rareDiamondTag","diamond","customDiamond","previewBtn","certBtn","shopItem","consumerItemBtn","sizeCont"])
            {
               if(_loc5_.hasOwnProperty(_loc8_) && _loc5_[_loc8_] is DisplayObject)
               {
                  DisplayObject(_loc5_[_loc8_]).visible = false;
               }
            }
            _loc5_.cir.gotoAndStop("up");
            _loc6_ = _loc5_.getBounds(_loc5_);
            var _loc9_:Number = Math.min(1,(param2 - 2) / _loc6_.width,(param3 - 2) / _loc6_.height);
            _loc5_.scaleX = _loc5_.scaleY = _loc9_;
            _loc5_.x = (param2 - _loc6_.width * _loc9_) * 0.5 - _loc6_.x * _loc9_;
            _loc5_.y = (param3 - _loc6_.height * _loc9_) * 0.5 - _loc6_.y * _loc9_;
            _loc4_.addChild(_loc5_);
            _loc7_ = Math.min(_loc6_.width,_loc6_.height) * _loc9_ * 0.72;
         }
         catch(e:Error)
         {
            _loc5_ = null;
            _loc4_.graphics.lineStyle(2,DenUi.WOOD_DARK);
            _loc4_.graphics.beginFill(DenUi.CREAM);
            _loc4_.graphics.drawCircle(param2 * 0.5,param3 * 0.5,Math.min(param2,param3) * 0.45);
            _loc4_.graphics.endFill();
         }
         var _loc10_:Sprite = new Sprite();
         _loc10_.mouseEnabled = false;
         _loc10_.mouseChildren = false;
         _loc10_.x = param2 * 0.5;
         _loc10_.y = param3 * 0.5 - 4;
         _loc4_.addChild(_loc10_);
         var _loc11_:String = "";
         if(param1.kind == "new")
         {
            var _loc12_:Shape = new Shape();
            DenUi.drawCrates(_loc12_.graphics,0,0,1.6);
            _loc10_.addChild(_loc12_);
            drawPlus(_loc10_.graphics,13,-12);
            _loc11_ = "Save new";
         }
         else if(param1.kind == "code")
         {
            var _loc13_:TextField = DenUi.text("ABC",15,DenUi.TEXT);
            _loc13_.x = -_loc13_.width * 0.5;
            _loc13_.y = -_loc13_.height * 0.5 - 2;
            _loc10_.addChild(_loc13_);
            _loc11_ = "Enter code";
         }
         else
         {
            picture(param1,_loc10_,_loc7_);
            _loc11_ = param1.name;
            var _loc14_:TextField = DenUi.text(String(param1.count),10,0xFFFFFF);
            var _loc15_:Sprite = new Sprite();
            _loc15_.graphics.lineStyle(1.5,0xFFFFFF);
            _loc15_.graphics.beginFill(DenUi.WOOD);
            _loc15_.graphics.drawRoundRect(0,0,_loc14_.width + 8,15,15,15);
            _loc15_.graphics.endFill();
            _loc14_.x = 4;
            _loc14_.y = 0;
            _loc15_.addChild(_loc14_);
            _loc15_.mouseEnabled = false;
            _loc15_.mouseChildren = false;
            _loc15_.x = param2 - _loc15_.width - 4;
            _loc15_.y = 5;
            _loc4_.addChild(_loc15_);
         }
         var _loc16_:TextField = DenUi.text("",10,0xFFFFFF);
         _loc16_.filters = [new GlowFilter(0x6D4330,1,3,3,10)];
         DenUi.fitText(_loc16_,_loc11_,param2 - 6);
         _loc16_.x = (param2 - _loc16_.width) * 0.5;
         _loc16_.y = param3 - _loc16_.height - 3;
         _loc4_.addChild(_loc16_);
         // "In den" while what it put down is still in this den
         var _loc17_:Sprite = null;
         if(param1.kind == "prefab" && placedOf(param1.id).length > 0)
         {
            var _loc18_:TextField = DenUi.text("In den",10,0xFFFFFF);
            _loc17_ = new Sprite();
            _loc17_.graphics.lineStyle(1.5,0xFFFFFF);
            _loc17_.graphics.beginFill(0x4FA52F);
            _loc17_.graphics.drawRoundRect(0,0,_loc18_.width + 8,15,15,15);
            _loc17_.graphics.endFill();
            _loc18_.x = 4;
            _loc17_.addChild(_loc18_);
            _loc17_.mouseEnabled = false;
            _loc17_.mouseChildren = false;
            _loc17_.x = 4;
            _loc17_.y = 5;
            _loc4_.addChild(_loc17_);
         }
         _loc4_.buttonMode = true;
         _loc4_.addEventListener("mouseOver",function(param2:MouseEvent):void
         {
            if(_loc5_)
            {
               _loc5_.cir.gotoAndStop("over");
            }
            AJAudio.playSubMenuBtnRollover();
         },false,0,false);
         _loc4_.addEventListener("mouseOut",function(param2:MouseEvent):void
         {
            if(_loc5_)
            {
               _loc5_.cir.gotoAndStop("up");
            }
         },false,0,false);
         _loc4_.addEventListener("mouseDown",function(param2:MouseEvent):void
         {
            param2.stopPropagation();
            AJAudio.playSubMenuBtnClick();
            if(param1.kind == "new")
            {
               saveNew(_holder.pickedItems.length > 0 ? _holder.pickedItems : chosenGroup());
            }
            else if(param1.kind == "code")
            {
               askCode();
            }
            else
            {
               details(param1);
            }
         },false,0,false);
         return _loc4_;
      }

      // what "Save new" takes when nothing is picked: the chosen item's group
      private function chosenGroup() : Array
      {
         var _loc1_:DenStateItem = _holder.selectedItem;
         if(_loc1_ == null)
         {
            return [];
         }
         var _loc2_:int = _holder.groupIdOf(_loc1_);
         return _loc2_ != 0 ? _holder.groupMembers(_loc2_) : [_loc1_];
      }

      private function drawPlus(param1:Graphics, param2:Number, param3:Number) : void
      {
         param1.lineStyle(1.5,0x2F7420);
         param1.beginFill(0x4FA52F);
         param1.drawCircle(param2,param3,7);
         param1.endFill();
         param1.lineStyle(2.5,0xFFFFFF);
         param1.moveTo(param2 - 3.5,param3);
         param1.lineTo(param2 + 3.5,param3);
         param1.moveTo(param2,param3 - 3.5);
         param1.lineTo(param2,param3 + 3.5);
         param1.lineStyle();
      }

      private function drawPencil(param1:Graphics, param2:Number) : void
      {
         param1.lineStyle(2,0xFFFFFF);
         param1.moveTo(-3,3);
         param1.lineTo(3,-3);
         param1.lineStyle();
         param1.beginFill(0xFFFFFF);
         param1.drawCircle(-3.5,3.5,1.2);
         param1.endFill();
      }

      private function drawShare(param1:Graphics, param2:Number) : void
      {
         param1.lineStyle(2,0xFFFFFF);
         param1.moveTo(0,3.5);
         param1.lineTo(0,-3);
         param1.moveTo(-3,0);
         param1.lineTo(0,-3.5);
         param1.lineTo(3,0);
         param1.lineStyle();
      }

      // a prefab's picture, from the server (or crates when it has none)
      private function picture(param1:Object, param2:Sprite, param3:Number) : void
      {
         if(!param1.hasThumb)
         {
            var _loc4_:Shape = new Shape();
            DenUi.drawCrates(_loc4_.graphics,0,0,1.6);
            param2.addChild(_loc4_);
            return;
         }
         var _loc5_:BitmapData = _pictures[param1.id];
         if(_loc5_ != null)
         {
            var _loc6_:Bitmap = new Bitmap(_loc5_,"auto",true);
            var _loc7_:Number = Math.min(param3 / _loc5_.width,param3 / _loc5_.height);
            _loc6_.scaleX = _loc6_.scaleY = _loc7_;
            _loc6_.x = -_loc5_.width * _loc7_ * 0.5;
            _loc6_.y = -_loc5_.height * _loc7_ * 0.5;
            param2.addChild(_loc6_);
            return;
         }
         if(_waiting[param1.id])
         {
            return;
         }
         _waiting[param1.id] = true;
         var _loc8_:Loader = new Loader();
         _loc8_.contentLoaderInfo.addEventListener("complete",function(param1:Event):void
         {
            try
            {
               _pictures[_loc9_] = Bitmap(_loc8_.content).bitmapData;
            }
            catch(e:Error)
            {
            }
            delete _waiting[_loc9_];
            draw();
         },false,0,false);
         _loc8_.contentLoaderInfo.addEventListener("ioError",function(param1:IOErrorEvent):void
         {
            delete _waiting[_loc9_];
         },false,0,false);
         var _loc9_:String = param1.id;
         _loc8_.load(new URLRequest(gMainFrame.clientInfo.websiteURL + "denprefab/" + param1.id + ".png"));
      }

      // ---- the server's answers (DenXtCommManager.prefabCallback) ----

      public function onReply(param1:Object) : void
      {
         var _loc2_:Boolean = String(param1[2]) == "1";
         switch(String(param1[0]))
         {
            case "dpl":
               _prefabs = [];
               var _loc3_:int = int(param1[3]);
               var _loc4_:int = 0;
               while(_loc4_ < _loc3_)
               {
                  var _loc5_:int = 4 + _loc4_ * 5;
                  _prefabs.push({
                     "kind":"prefab",
                     "id":String(param1[_loc5_]),
                     "name":String(param1[_loc5_ + 1]),
                     "count":int(param1[_loc5_ + 2]),
                     "hasThumb":String(param1[_loc5_ + 3]) == "1",
                     "code":String(param1[_loc5_ + 4] == null ? "" : param1[_loc5_ + 4])
                  });
                  _loc4_++;
               }
               draw();
               break;
            case "dps":
               if(_loc2_)
               {
                  say("Prefab \"" + param1[4] + "\" saved. It is in your prefab tab.");
                  DenXtCommManager.requestPrefabList();
               }
               else
               {
                  say(String(param1[3]));
               }
               break;
            case "dpn":
            case "dpd":
               if(_loc2_ && String(param1[0]) == "dpd")
               {
                  delete _inDen[String(param1[3])];
                  saveInDen();
               }
               if(!_loc2_)
               {
                  say(String(param1[3]));
               }
               DenXtCommManager.requestPrefabList();
               break;
            case "dpx":
               if(_loc2_)
               {
                  if(_details != null && _detailsId == String(param1[3]))
                  {
                     _detailsCode.text = codeText(String(param1[4]));
                  }
                  else
                  {
                     showCode(String(param1[4]));
                  }
                  for each(var _loc8_:Object in _prefabs)
                  {
                     if(_loc8_.id == String(param1[3]))
                     {
                        _loc8_.code = String(param1[4]);
                     }
                  }
               }
               else
               {
                  say(String(param1[3]));
               }
               break;
            case "dpi":
               say(_loc2_ ? "Prefab \"" + param1[4] + "\" copied to your prefabs." : String(param1[3]));
               if(_loc2_)
               {
                  DenXtCommManager.requestPrefabList();
               }
               break;
            case "dpo":
               if(!_loc2_)
               {
                  say(String(param1[3]));
                  _spawning = null;
                  return;
               }
               var _loc6_:Array = [];
               var _loc7_:int = int(param1[5]);
               _loc4_ = 0;
               while(_loc4_ < _loc7_)
               {
                  _loc5_ = 6 + _loc4_ * 5;
                  _loc6_.push([int(param1[_loc5_]),int(param1[_loc5_ + 1]),int(param1[_loc5_ + 2]),int(param1[_loc5_ + 3]),int(param1[_loc5_ + 4])]);
                  _loc4_++;
               }
               if(_spawning != null && _spawning.id == String(param1[3]))
               {
                  _spawning.items = _loc6_;
                  plan();
               }
               break;
            case "dpc":
               if(_loc2_)
               {
                  say("Duplicated as \"" + param1[4] + "\".");
                  DenXtCommManager.requestPrefabList();
               }
               else
               {
                  say(String(param1[3]));
               }
               break;
            case "dpg":
            case "ddg":
               if(!_loc2_)
               {
                  say(String(param1[3]));
                  _spawning = null;
                  return;
               }
               if(_spawning != null)
               {
                  if(int(param1[4]) > 0)
                  {
                     say(int(param1[4]) == 1 ? "1 item of this prefab could not be added: the game has it no more." : int(param1[4]) + " items of this prefab could not be added: the game has them no more.");
                  }
                  putDown();
               }
         }
      }

      private function say(param1:String) : void
      {
         new SBOkPopup(_layer,param1);
      }

      // ---- saving ----

      // what a prefab can hold: what can be grouped, not a masterpiece
      private function keepable(param1:Array) : Array
      {
         return param1.filter(function(param1:DenStateItem, param2:int, param3:Array):Boolean
         {
            return _holder.canGroup(param1) && param1.uniqueImageId == "";
         });
      }

      public function saveNew(param1:Array) : void
      {
         var _loc2_:Array = keepable(param1);
         if(_loc2_.length == 0)
         {
            say("Pick the items for your prefab first: Shift+click them in your den (or choose a group), then press Save.");
            return;
         }
         if(_loc2_.length > 200)
         {
            say("A prefab holds 200 items at most. Pick fewer.");
            return;
         }
         if(_prefabs.length >= 50)
         {
            say("You have 50 prefabs already. Delete one first.");
            return;
         }
         var _loc3_:String = _loc2_.length == param1.length ? "" : "\n(Pets and masterpieces are left out.)";
         DenUi.prompt(_layer,"Save prefab","Name your prefab of " + _loc2_.length + (_loc2_.length == 1 ? " item." : " items.") + _loc3_,"My prefab",[["Save","green",function(param1:String):void
         {
            var _loc2_:String = param1.replace(/^\s+|\s+$/g,"");
            if(_loc2_ == "")
            {
               say("Give it a name.");
               return;
            }
            DenXtCommManager.requestPrefabSave(_loc2_,thumbnail(_loc4_),rows(_loc4_));
         }],["Cancel","red",null]],30);
         var _loc4_:Array = _loc2_;
      }

      // [def, version, x, y, flip] each, from the middle of them all
      private function rows(param1:Array) : Array
      {
         var _loc2_:Number = Infinity;
         var _loc3_:Number = -Infinity;
         var _loc4_:Number = Infinity;
         var _loc5_:Number = -Infinity;
         var _loc6_:DenStateItem = null;
         for each(_loc6_ in param1)
         {
            _loc2_ = Math.min(_loc2_,_loc6_.x - _loc6_.offsetX);
            _loc3_ = Math.max(_loc3_,_loc6_.x - _loc6_.offsetX);
            _loc4_ = Math.min(_loc4_,_loc6_.y - _loc6_.offsetY);
            _loc5_ = Math.max(_loc5_,_loc6_.y - _loc6_.offsetY);
         }
         var _loc7_:Number = Math.round((_loc2_ + _loc3_) * 0.5);
         var _loc8_:Number = Math.round((_loc4_ + _loc5_) * 0.5);
         _rowsMiddle = new Point(_loc7_,_loc8_);
         var _loc9_:Array = [];
         for each(_loc6_ in param1)
         {
            _loc9_.push([_loc6_.defId,Math.max(0,_loc6_.version),Math.round(_loc6_.x - _loc6_.offsetX - _loc7_),Math.round(_loc6_.y - _loc6_.offsetY - _loc8_),DenItemHolder.plainFlip(_loc6_.flipped)]);
         }
         return _loc9_;
      }

      // a little picture of them, as they stand, for the tile (base64
      // PNG; "" when the game may not draw them)
      private function thumbnail(param1:Array) : String
      {
         var _loc2_:Rectangle = null;
         var _loc3_:DenStateItem = null;
         var _loc4_:DisplayObject = null;
         try
         {
            var _loc5_:Array = param1.concat();
            _loc5_.sort(function(param1:DenStateItem, param2:DenStateItem):int
            {
               var _loc3_:int = (_holder.isFloorItem(param1) ? 0 : 1) - (_holder.isFloorItem(param2) ? 0 : 1);
               if(_loc3_ != 0)
               {
                  return _loc3_;
               }
               var _loc4_:Number = _holder.depthKey(param1) - _holder.depthKey(param2);
               return _loc4_ > 0 ? 1 : (_loc4_ < 0 ? -1 : 0);
            });
            for each(_loc3_ in _loc5_)
            {
               _loc4_ = _loc3_.denItemHelper.displayObject;
               var _loc6_:Rectangle = _loc4_.getBounds(gMainFrame.stage);
               _loc2_ = _loc2_ ? _loc2_.union(_loc6_) : _loc6_;
            }
            if(_loc2_ == null || _loc2_.width <= 0 || _loc2_.height <= 0)
            {
               return "";
            }
            var _loc7_:Number = Math.min(THUMB_W / _loc2_.width,THUMB_H / _loc2_.height,1);
            var _loc8_:BitmapData = new BitmapData(THUMB_W,THUMB_H,true,0);
            var _loc9_:Number = (THUMB_W - _loc2_.width * _loc7_) * 0.5;
            var _loc10_:Number = (THUMB_H - _loc2_.height * _loc7_) * 0.5;
            for each(_loc3_ in _loc5_)
            {
               _loc4_ = _loc3_.denItemHelper.displayObject;
               var _loc11_:Array = _loc4_.filters;
               _loc4_.filters = [];
               var _loc12_:Matrix = _loc4_.transform.concatenatedMatrix;
               _loc12_.translate(-_loc2_.x,-_loc2_.y);
               _loc12_.scale(_loc7_,_loc7_);
               _loc12_.translate(_loc9_,_loc10_);
               _loc8_.draw(_loc4_,_loc12_,null,null,null,true);
               _loc4_.filters = _loc11_;
            }
            var _loc13_:ByteArray = AJClient.encodePng(_loc8_);
            _loc8_.dispose();
            return base64(_loc13_);
         }
         catch(e:Error)
         {
         }
         return "";
      }

      private static function base64(param1:ByteArray) : String
      {
         var _loc2_:String = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
         var _loc3_:Array = [];
         var _loc4_:uint = 0;
         var _loc5_:uint = param1.length;
         while(_loc4_ < _loc5_)
         {
            var _loc6_:uint = param1[_loc4_] << 16 | (_loc4_ + 1 < _loc5_ ? param1[_loc4_ + 1] << 8 : 0) | (_loc4_ + 2 < _loc5_ ? param1[_loc4_ + 2] : 0);
            _loc3_.push(_loc2_.charAt(_loc6_ >> 18 & 63) + _loc2_.charAt(_loc6_ >> 12 & 63) + (_loc4_ + 1 < _loc5_ ? _loc2_.charAt(_loc6_ >> 6 & 63) : "=") + (_loc4_ + 2 < _loc5_ ? _loc2_.charAt(_loc6_ & 63) : "="));
            _loc4_ += 3;
         }
         return _loc3_.join("");
      }

      // ---- the prefab's own buttons ----

      private function rename(param1:Object) : void
      {
         DenUi.prompt(_layer,"Rename prefab","A new name for \"" + param1.name + "\":",param1.name,[["Rename","green",function(param1:String):void
         {
            var _loc2_:String = param1.replace(/^\s+|\s+$/g,"");
            if(_loc2_ != "")
            {
               DenXtCommManager.requestPrefabRename(_loc3_,_loc2_);
            }
         }],["Cancel","red",null]],30);
         var _loc3_:String = param1.id;
      }

      private function share(param1:Object) : void
      {
         if(param1.code)
         {
            showCode(param1.code);
            return;
         }
         DenXtCommManager.requestPrefabShare(param1.id);
      }

      private function showCode(param1:String) : void
      {
         var _loc2_:String = codeText(param1);
         DenUi.prompt(_layer,"Share prefab","Anyone who types this code in their prefab tab (Enter code) gets a copy of it, for as long as you keep it.",_loc2_,[["Copy","blue",function(param1:String):void
         {
            System.setClipboard(_loc2_);
         }],["Done","green",null]],12,true);
      }

      private function askCode() : void
      {
         DenUi.prompt(_layer,"Enter code","Type the code of a prefab someone shared, and it is copied to your prefabs.","",[["Copy it","green",function(param1:String):void
         {
            var _loc2_:String = param1.replace(/[\s-]/g,"");
            if(_loc2_ != "")
            {
               DenXtCommManager.requestPrefabImport(_loc2_);
            }
         }],["Cancel","red",null]],12);
      }

      private function remove(param1:Object) : void
      {
         new SBYesNoPopup(_layer,"Delete the prefab \"" + param1.name + "\"? Its share code stops working too. The items in your den stay as they are.",true,function(param1:Object):void
         {
            if(param1.status)
            {
               DenXtCommManager.requestPrefabDelete(_loc2_);
            }
         });
         var _loc2_:String = param1.id;
      }

      // ---- putting one down ----

      private var _spawning:Object;
      // where rows() measured from, in den coordinates
      private var _rowsMiddle:Point;
      // how far from the originals duplicates go down
      private static const DUPLICATE_STEP:Number = 30;

      // den items copied in the den editor: the same again, a little down
      // and to the right, from the player's free items or given free (as a
      // prefab's are). a group's copy is a new group; loose items stay loose.
      public function duplicateItems(param1:Array) : void
      {
         if(busy())
         {
            return;
         }
         var _loc2_:Array = keepable(param1);
         if(_loc2_.length == 0)
         {
            say(param1.length > 0 ? "Pets and masterpieces cannot be duplicated." : "Choose an item to duplicate first.");
            return;
         }
         if(_loc2_.length > 200)
         {
            say("You can duplicate 200 items at most at once.");
            return;
         }
         var _loc3_:int = _holder.groupIdOf(_loc2_[0]);
         for each(var _loc4_:DenStateItem in _loc2_)
         {
            if(_holder.groupIdOf(_loc4_) != _loc3_)
            {
               _loc3_ = 0;
            }
         }
         var _loc5_:Array = rows(_loc2_);
         _spawning = {
            "id":null,
            "name":_loc2_.length == 1 ? "The copy" : "The copies",
            "items":_loc5_,
            "at":new Point(_rowsMiddle.x + DUPLICATE_STEP,_rowsMiddle.y + DUPLICATE_STEP),
            "group":_loc3_ != 0
         };
         plan();
      }

      private function duplicatePrefab(param1:Object) : void
      {
         if(_prefabs.length >= 50)
         {
            say("You have 50 prefabs already. Delete one first.");
            return;
         }
         DenXtCommManager.requestPrefabDuplicate(param1.id);
      }

      private function spawn(param1:Object) : void
      {
         if(busy())
         {
            return;
         }
         _spawning = {
            "id":param1.id,
            "name":param1.name,
            "items":null,
            "at":null,
            "group":true
         };
         DenXtCommManager.requestPrefab(param1.id);
         watch();
      }

      // a prefab (or copy) still on its way down: say so rather than do
      // nothing
      private function busy() : Boolean
      {
         if(_spawning == null)
         {
            return false;
         }
         say("Still putting down the last one. Wait a moment, then try again.");
         return true;
      }

      // the server is asked something for what is being put down: when no
      // answer comes, it is given up, and said why, so nothing stays stuck
      private function watch() : void
      {
         var _loc1_:Object = _spawning;
         var _loc2_:Timer = new Timer(15000,1);
         _loc2_.addEventListener("timer",function(param1:TimerEvent):void
         {
            if(_spawning != null && _spawning == _loc1_)
            {
               _spawning = null;
               say("The server did not answer, so nothing was put down. If the server was just updated, restart it so it has the new prefab and duplicate commands.");
            }
         },false,0,false);
         _loc2_.start();
      }

      private function inventory() : DenItemCollection
      {
         return gMainFrame.userInfo.playerUserInfo.denItemsFull;
      }

      private function fitsDen(param1:int) : Boolean
      {
         var _loc2_:Object = DenXtCommManager.getDenItemDef(param1);
         if(_loc2_ == null)
         {
            return false;
         }
         var _loc3_:int = int(_loc2_.enviroType);
         return _loc3_ == AvatarManager.roomEnviroType || _loc3_ == 3;
      }

      // which of the player's free den items each of the prefab's takes;
      // [placed: [[DenItem, entry]...], missing: count, wrong: count]
      private function match() : Object
      {
         var _loc1_:DenItemCollection = inventory();
         var _loc2_:Object = {};
         var _loc3_:Array = [];
         var _loc4_:int = 0;
         var _loc5_:int = 0;
         var _loc6_:Object = {};
         for each(var _loc7_:DenStateItem in _holder.placedItems)
         {
            if(_loc7_.refId == 0)
            {
               _loc6_[_loc7_.invIdx] = true;
            }
         }
         for each(var _loc8_:Array in _spawning.items)
         {
            if(!fitsDen(_loc8_[0]))
            {
               _loc5_++;
               continue;
            }
            var _loc9_:DenItem = null;
            var _loc10_:int = 0;
            while(_loc1_ && _loc10_ < _loc1_.length)
            {
               var _loc11_:DenItem = _loc1_.getDenItem(_loc10_);
               if(_loc11_ && _loc11_.defId == _loc8_[0] && _loc11_.version == _loc8_[1] && _loc11_.categoryId == 0 && !_loc2_[_loc11_.invIdx] && !_loc6_[_loc11_.invIdx] && _loc11_.typeCatId != 4)
               {
                  _loc9_ = _loc11_;
                  break;
               }
               _loc10_++;
            }
            if(_loc9_ != null)
            {
               _loc2_[_loc9_.invIdx] = true;
               _loc3_.push([_loc9_,_loc8_]);
            }
            else
            {
               _loc4_++;
            }
         }
         return {
            "placed":_loc3_,
            "missing":_loc4_,
            "wrong":_loc5_
         };
      }

      // what is had, what is not, and whether to add it
      private function plan() : void
      {
         var _loc1_:Object = match();
         var _loc2_:int = _loc1_.placed.length + _loc1_.missing;
         if(_loc2_ == 0)
         {
            say(_loc1_.wrong > 0 ? "This prefab's items are all for another kind of den (land or ocean)." : "This prefab is empty.");
            _spawning = null;
            return;
         }
         if(_holder.numberOfInUseItems + _loc2_ > MAX_PLACED)
         {
            say("That would be " + (_holder.numberOfInUseItems + _loc2_) + " items in this den, and a den holds " + MAX_PLACED + ". Put some away first.");
            _spawning = null;
            return;
         }
         var _loc3_:String = _loc1_.wrong > 0 ? "\n" + _loc1_.wrong + " of its items are for another kind of den, and are left out." : "";
         if(_loc1_.missing == 0)
         {
            if(_loc3_ != "")
            {
               say(_loc3_.substr(1));
            }
            putDown();
            return;
         }
         var _loc4_:int = inventory() ? int(inventory().length) : 0;
         var _loc5_:int = ShopManager.maxDenItems;
         if(_loc4_ + _loc1_.missing > _loc5_)
         {
            new SBYesNoPopup(_layer,"This prefab needs " + _loc1_.missing + " den items you do not have free, but you have room for only " + Math.max(0,_loc5_ - _loc4_) + " more (" + _loc4_ + " of " + _loc5_ + "). Recycle some to make room.\n\nPut down just the ones you have?",true,function(param1:Object):void
            {
               if(param1.status && _loc1_.placed.length > 0)
               {
                  putDown();
               }
               else
               {
                  _spawning = null;
               }
            });
            return;
         }
         var _loc6_:String = (_spawning.id != null ? "\"" + _spawning.name + "\"" : _spawning.name) + " needs " + (_loc1_.missing == 1 ? "1 den item" : _loc1_.missing + " den items") + " you do not have free. Add " + (_loc1_.missing == 1 ? "it" : "them") + " to your den items, free?";
         if(_loc4_ + _loc1_.missing > _loc5_ * 0.9)
         {
            _loc6_ += "\n\nYour den items are getting full: you will have " + (_loc4_ + _loc1_.missing) + " of " + _loc5_ + ".";
         }
         new SBYesNoPopup(_layer,_loc6_ + _loc3_,true,function(param1:Object):void
         {
            if(param1.status)
            {
               // the server is told where everything stands first, so that
               // it knows which items are free
               DenXtCommManager.saveDenItemsState();
               if(_spawning.id != null)
               {
                  DenXtCommManager.requestPrefabGive(_spawning.id);
               }
               else
               {
                  DenXtCommManager.requestItemsGive(_spawning.items);
               }
               watch();
            }
            else
            {
               _spawning = null;
            }
         });
      }

      // the prefab's items put down, as one group, in the middle of the screen
      private function putDown() : void
      {
         var _loc1_:Object = match();
         var _loc2_:Point = _spawning.at != null ? _spawning.at : RoomManagerWorld.instance.convertScreenToWorldSpace(520,250);
         var _loc3_:int = _loc1_.placed.length > 1 && _spawning.group ? _holder.newGroupId() : 0;
         var _loc4_:Array = [];
         for each(var _loc5_:Array in _loc1_.placed)
         {
            var _loc6_:Array = _loc5_[1];
            _loc4_.push([_loc5_[0],_loc2_.x + _loc6_[2],_loc2_.y + _loc6_[3],DenItemHolder.inGroup(_loc6_[4],_loc3_)]);
         }
         var _loc7_:Array = [];
         for each(_loc5_ in _loc1_.placed)
         {
            _loc7_.push(DenItem(_loc5_[0]).invIdx);
         }
         if(_loc7_.length > 0 && _spawning.id != null)
         {
            _inDen[_spawning.id] = _loc7_;
            saveInDen();
         }
         _spawning = null;
         if(_loc4_.length > 0 && _place != null)
         {
            _place(_loc4_);
         }
         draw();
         if(_loc1_.missing > 0)
         {
            say(_loc1_.missing == 1 ? "1 item could not be put down: you do not have it." : _loc1_.missing + " items could not be put down: you do not have them.");
         }
      }

      // ---- what a prefab put in the den ----

      private function saveInDen() : void
      {
         try
         {
            var _loc1_:SharedObject = SharedObject.getLocal("denPrefabs");
            _loc1_.data.inDen = _inDen;
            _loc1_.flush();
         }
         catch(e:Error)
         {
         }
      }

      // the den's items that prefab `param1` put down and are still there
      private function placedOf(param1:String) : Array
      {
         var _loc2_:Array = _inDen[param1] as Array;
         var _loc3_:Array = [];
         if(_loc2_ == null || _loc2_.length == 0)
         {
            return _loc3_;
         }
         for each(var _loc4_:DenStateItem in _holder.placedItems)
         {
            if(_loc4_.refId == 0 && _loc2_.indexOf(_loc4_.invIdx) >= 0)
            {
               _loc3_.push(_loc4_);
            }
         }
         return _loc3_;
      }

      private function putAway(param1:Object) : void
      {
         var _loc2_:Array = placedOf(param1.id);
         if(_loc2_.length == 0)
         {
            return;
         }
         _holder.putAway(_loc2_);
         delete _inDen[param1.id];
         saveInDen();
         draw();
      }

      private function codeText(param1:String) : String
      {
         return param1.length == 8 ? param1.substr(0,4) + "-" + param1.substr(4) : param1;
      }

      // ---- a prefab's details: its picture, its code, and what to do ----

      private function details(param1:Object) : void
      {
         closeDetails();
         var _loc2_:Number = 460;
         var _loc3_:Number = 236;
         var _loc4_:Sprite = new Sprite();
         _loc4_.graphics.beginFill(0,0.35);
         _loc4_.graphics.drawRect(0,0,900,550);
         _loc4_.graphics.endFill();
         _loc4_.addEventListener("mouseDown",DenUi.stop,false,0,true);
         _loc4_.addEventListener("mouseMove",DenUi.stop,false,0,true);
         _loc4_.addEventListener("click",DenUi.stop,false,0,true);
         var _loc5_:Sprite = new Sprite();
         _loc5_.x = int((900 - _loc2_) * 0.5);
         _loc5_.y = int((550 - _loc3_) * 0.45);
         _loc4_.addChild(_loc5_);
         DenUi.woodBox(_loc5_.graphics,_loc2_,_loc3_);
         DenUi.titleStrip(_loc5_.graphics,14,10,_loc2_ - 56,26);
         var _loc6_:TextField = DenUi.title("",14);
         DenUi.fitText(_loc6_,param1.name,_loc2_ - 80);
         _loc6_.x = int((_loc2_ - 42 - _loc6_.width) * 0.5);
         _loc6_.y = 13;
         _loc5_.addChild(_loc6_);
         var _loc7_:Sprite = DenUi.roundButton(12,DenUi.drawCross,closeDetails);
         _loc7_.x = _loc2_ - 24;
         _loc7_.y = 23;
         _loc5_.addChild(_loc7_);
         // its picture, in a cream inset
         _loc5_.graphics.lineStyle(1.5,0xB89B5E);
         _loc5_.graphics.beginFill(DenUi.CREAM_LIGHT);
         _loc5_.graphics.drawRoundRect(22,46,112,88,14,14);
         _loc5_.graphics.endFill();
         _loc5_.graphics.lineStyle();
         var _loc8_:Sprite = new Sprite();
         _loc8_.mouseEnabled = false;
         _loc8_.mouseChildren = false;
         _loc8_.x = 78;
         _loc8_.y = 90;
         _loc5_.addChild(_loc8_);
         picture(param1,_loc8_,84);
         // how many, and whether it is down
         var _loc9_:Array = placedOf(param1.id);
         var _loc10_:TextField = DenUi.text(param1.count == 1 ? "1 item" : param1.count + " items",14,DenUi.TEXT);
         _loc10_.x = 146;
         _loc10_.y = 48;
         _loc5_.addChild(_loc10_);
         var _loc21_:TextField = DenUi.text(_loc9_.length > 0 ? "In this den now" : "Not in this den",12,_loc9_.length > 0 ? 0x2F7420 : DenUi.TEXT_SOFT);
         _loc21_.x = 146;
         _loc21_.y = 68;
         _loc5_.addChild(_loc21_);
         // its share code
         var _loc11_:TextField = DenUi.text("Share code:",12,DenUi.TEXT_SOFT);
         _loc11_.x = 146;
         _loc11_.y = 90;
         _loc5_.addChild(_loc11_);
         _loc5_.graphics.lineStyle(2,0xC9A86A);
         _loc5_.graphics.beginFill(0xFFFFFF);
         _loc5_.graphics.drawRoundRect(146,108,124,26,14,14);
         _loc5_.graphics.endFill();
         _loc5_.graphics.lineStyle();
         _detailsCode = new TextField();
         _detailsCode.type = "dynamic";
         _detailsCode.selectable = true;
         _detailsCode.embedFonts = AJClient.hasGameFont();
         _detailsCode.defaultTextFormat = new TextFormat(_detailsCode.embedFonts ? "CCDigitalDelivery" : "Arial",14,DenUi.TEXT,true,null,null,null,null,"center");
         _detailsCode.x = 150;
         _detailsCode.y = 111;
         _detailsCode.width = 116;
         _detailsCode.height = 22;
         _detailsCode.text = param1.code ? codeText(param1.code) : "...";
         _loc5_.addChild(_detailsCode);
         var _loc12_:Sprite = DenUi.bluePill("Copy",72,function():void
         {
            if(_detailsCode != null && _detailsCode.text.length > 3)
            {
               System.setClipboard(_detailsCode.text);
               _detailsCode.setSelection(0,_detailsCode.length);
            }
         },26);
         _loc12_.x = 280;
         _loc12_.y = 108;
         _loc5_.addChild(_loc12_);
         var _loc13_:TextField = DenUi.text("Anyone who types this code in their prefab tab (Enter code) gets a copy.",10,DenUi.TEXT_SOFT,false);
         _loc13_.x = int((_loc2_ - _loc13_.width) * 0.5);
         _loc13_.y = 146;
         _loc5_.addChild(_loc13_);
         // what to do with it
         var _loc14_:Number = (_loc2_ - 32 - 40) / 5;
         var _loc15_:Sprite = DenUi.greenPill("Put in den",_loc14_,function():void
         {
            closeDetails();
            spawn(param1);
         },30);
         var _loc16_:Sprite = DenUi.goldPill("Put away",_loc14_,function():void
         {
            closeDetails();
            putAway(param1);
         },30);
         DenUi.setEnabled(_loc16_,_loc9_.length > 0);
         var _loc17_:Sprite = DenUi.bluePill("Rename",_loc14_,function():void
         {
            closeDetails();
            rename(param1);
         },30);
         var _loc22_:Sprite = DenUi.bluePill("Duplicate",_loc14_,function():void
         {
            closeDetails();
            duplicatePrefab(param1);
         },30);
         var _loc18_:Sprite = DenUi.redPill("Delete",_loc14_,function():void
         {
            closeDetails();
            remove(param1);
         },30);
         var _loc19_:int = 0;
         for each(var _loc20_:Sprite in [_loc15_,_loc16_,_loc17_,_loc22_,_loc18_])
         {
            _loc20_.x = 16 + _loc19_ * (_loc14_ + 10);
            _loc20_.y = _loc3_ - 50;
            _loc5_.addChild(_loc20_);
            _loc19_++;
         }
         _details = _loc4_;
         _detailsId = param1.id;
         _layer.addChild(_loc4_);
         gMainFrame.stage.addEventListener("keyDown",onDetailsKey,false,0,true);
         if(!param1.code)
         {
            DenXtCommManager.requestPrefabShare(param1.id);
         }
      }

      private function onDetailsKey(param1:KeyboardEvent) : void
      {
         if(param1.keyCode == 27)
         {
            closeDetails();
         }
      }

      private function closeDetails() : void
      {
         if(gMainFrame.stage)
         {
            gMainFrame.stage.removeEventListener("keyDown",onDetailsKey);
         }
         if(_details && _details.parent)
         {
            _details.parent.removeChild(_details);
         }
         _details = null;
         _detailsId = null;
         _detailsCode = null;
      }
   }
}
