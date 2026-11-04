package gui
{
   import collection.DenItemCollection;
   import den.DenItem;
   import den.DenStateItem;
   import den.DenXtCommManager;
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.display.DisplayObject;
   import flash.display.DisplayObjectContainer;
   import flash.display.Graphics;
   import flash.display.Shape;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.events.TimerEvent;
   import flash.geom.Matrix;
   import flash.geom.Point;
   import flash.geom.Rectangle;
   import flash.net.SharedObject;
   import flash.text.TextField;
   import flash.utils.Dictionary;
   import flash.utils.Timer;
   import pet.PetItem;
   import room.DenItemHolder;
   import room.DenItemHolderEvent;

   // the den editor's layers panel (this server): every item in the den,
   // front first, in four bands (above players, by position, below
   // players, on the floor), groups as rows that open to their items.
   // a row is clicked to choose its item (even one that is locked, hidden or
   // out of sight), Shift+clicked to pick it, and dragged to put it in front
   // of or behind others, in another band, or in or out of a group. its
   // buttons lock it and set its player depth; a group's say whether its
   // items are chosen as one. below the list: what is chosen, its colour,
   // and buttons for it. the pick bar, over the den editor's bottom bar,
   // makes the picked items a group (or a prefab).
   // the room's side of it all is room.DenItemHolder.
   public class DenLayersPanel extends Sprite
   {
      private static const X:Number = 8;
      private static const Y:Number = 8;
      // the depth button's words: what it is now (a click moves to the next)
      private static const DEPTH_PILL:Array = ["Depth: auto","Below all","Above all"];
      private static const PICK_H:Number = 80;
      private static const W:Number = 240;
      private static const HEAD:Number = 36;
      private static const ROW:Number = 24;
      private static const FOOT:Number = 92;
      private static const INSET:Number = 7;
      private static const LIST_X:Number = INSET + 3;
      private static const LIST_W:Number = W - INSET * 2 - 6 - 10;
      private static const BANDS:Array = [DenItemHolder.DEPTH_FRONT,DenItemHolder.DEPTH_AUTO,DenItemHolder.DEPTH_BEHIND,-1];
      private static const BAND_NAMES:Object = {
         "2":"Above players",
         "0":"Auto depth (by position)",
         "1":"Below players",
         "-1":"On the floor"
      };
      private static const BAND_SHORT:Object = {
         "2":"Above",
         "0":"Auto",
         "1":"Below",
         "-1":"Floor"
      };

      private var _holder:DenItemHolder;
      private var _layer:DisplayObjectContainer;
      private var _bottom:Function;
      private var _onSavePrefab:Function;
      private var _onDuplicate:Function;
      private var _pickDuplicateBtn:Sprite;
      private var _pickGridBtn:Sprite;
      private var _frame:Shape;
      private var _titleTxt:TextField;
      private var _countTxt:TextField;
      private var _collapseBtn:Sprite;
      private var _body:Sprite;
      private var _list:Sprite;
      private var _listMask:Shape;
      private var _rows:Array;
      private var _scrollTrack:Sprite;
      private var _scrollThumb:Sprite;
      private var _foot:Sprite;
      private var _ghost:Sprite;
      private var _dropLine:Shape;
      private var _pickBar:Sprite;
      private var _pickTxt:TextField;
      private var _pickGroupBtn:Sprite;
      private var _pickLockBtn:Sprite;
      private var _pickPrefabBtn:Sprite;
      private var _pickClearBtn:Sprite;

      private var _entries:Array;
      private var _bandItems:Object;
      private var _expanded:Object;
      private var _scroll:Number = 0;
      private var _listH:Number = 200;
      private var _collapsed:Boolean;
      private var _dirty:Boolean;
      private var _signature:String = "";
      private var _hover:int = -1;
      private var _down:int = -1;
      private var _downZone:String;
      private var _downPoint:Point;
      private var _downShift:Boolean;
      private var _dragging:Boolean;
      private var _dropGap:int = -1;
      private var _dropGroup:int = 0;
      private var _scrollDrag:Number = -1;
      private var _thumbs:Dictionary;
      private var _names:Object;
      private var _colourPending:Boolean;
      private var _poll:Timer;
      private var _shown:Boolean;

      public function DenLayersPanel(param1:DenItemHolder, param2:DisplayObjectContainer, param3:Function, param4:Function, param5:Function = null)
      {
         super();
         _holder = param1;
         _layer = param2;
         _bottom = param3;
         _onSavePrefab = param4;
         _onDuplicate = param5;
         _entries = [];
         _bandItems = {};
         _expanded = {};
         _rows = [];
         _thumbs = new Dictionary(true);
         _names = {};
         _collapsed = savedCollapsed();
         x = X;
         y = Y;
         build();
         buildPickBar();
         visible = false;
         _holder.addEventListener("OnLayersChanged",onChanged,false,0,true);
         _poll = new Timer(400);
         _poll.addEventListener("timer",onPoll,false,0,true);
         addEventListener("enterFrame",onFrame,false,0,true);
         addEventListener("mouseDown",onMouseDown,false,0,true);
         addEventListener("mouseMove",onMouseMove,false,0,true);
         addEventListener("mouseWheel",onWheel,false,0,true);
         addEventListener("rollOut",onRollOut,false,0,true);
         addEventListener("click",DenUi.stop,false,0,true);
      }

      public function destroy() : void
      {
         // off the screen first: whatever fails after, nothing of the panel
         // stays up in the next room
         visible = false;
         _shown = false;
         if(parent)
         {
            parent.removeChild(this);
         }
         if(_pickBar && _pickBar.parent)
         {
            _pickBar.parent.removeChild(_pickBar);
         }
         _holder.removeEventListener("OnLayersChanged",onChanged);
         _poll.stop();
         _poll.removeEventListener("timer",onPoll);
         removeEventListener("enterFrame",onFrame);
         try
         {
            _holder.setPreview(null);
            endPress();
         }
         catch(e:Error)
         {
         }
         // each is {bmp, version, flip} (thumbOf)
         for each(var _loc1_:Object in _thumbs)
         {
            if(_loc1_ != null && _loc1_.bmp is BitmapData)
            {
               BitmapData(_loc1_.bmp).dispose();
            }
         }
         _thumbs = new Dictionary(true);
      }

      // shown while the den is being edited
      public function show(param1:Boolean) : void
      {
         _shown = param1;
         visible = param1;
         if(param1)
         {
            if(parent == null)
            {
               _layer.addChild(this);
            }
            if(_pickBar.parent == null)
            {
               _layer.addChild(_pickBar);
            }
            _names = {};
            _poll.start();
            layout();
            _dirty = true;
         }
         else
         {
            _poll.stop();
            endPress();
            _holder.setPreview(null);
            _pickBar.visible = false;
         }
      }

      // a den item's name changed hands (its colour, or a new den item list)
      public function forgetNames() : void
      {
         _names = {};
         _dirty = true;
      }

      // ---- building ----

      private function build() : void
      {
         _frame = new Shape();
         addChild(_frame);
         _titleTxt = DenUi.title("Layers",15);
         _titleTxt.x = 18;
         _titleTxt.y = 8;
         addChild(_titleTxt);
         _countTxt = DenUi.text("",11,DenUi.TEXT);
         _countTxt.y = 11;
         addChild(_countTxt);
         _collapseBtn = DenUi.roundButton(11,drawCollapse,onCollapse);
         _collapseBtn.x = W - 20;
         _collapseBtn.y = 18;
         addChild(_collapseBtn);
         _body = new Sprite();
         addChild(_body);
         _list = new Sprite();
         _list.x = LIST_X;
         _list.y = HEAD;
         _body.addChild(_list);
         _listMask = new Shape();
         _body.addChild(_listMask);
         _list.mask = _listMask;
         _scrollTrack = new Sprite();
         _scrollTrack.buttonMode = true;
         _body.addChild(_scrollTrack);
         _scrollThumb = new Sprite();
         _scrollThumb.buttonMode = true;
         _body.addChild(_scrollThumb);
         _dropLine = new Shape();
         _dropLine.visible = false;
         _body.addChild(_dropLine);
         _foot = new Sprite();
         _body.addChild(_foot);
         _ghost = new Sprite();
         _ghost.mouseEnabled = false;
         _ghost.mouseChildren = false;
         _ghost.alpha = 0.8;
         _ghost.visible = false;
         addChild(_ghost);
      }

      // a minus to fold the panel away, a plus to open it again
      private function drawCollapse(param1:Graphics, param2:Number) : void
      {
         param1.lineStyle(2.5,0xFFFFFF,1,false,"normal","none");
         param1.moveTo(-5,0);
         param1.lineTo(5,0);
         if(_collapsed)
         {
            param1.moveTo(0,-5);
            param1.lineTo(0,5);
         }
         param1.lineStyle();
      }

      private function onCollapse() : void
      {
         _collapsed = !_collapsed;
         saveCollapsed(_collapsed);
         var _loc1_:Sprite = _collapseBtn;
         _collapseBtn = DenUi.roundButton(11,drawCollapse,onCollapse);
         _collapseBtn.x = _loc1_.x;
         _collapseBtn.y = _loc1_.y;
         addChildAt(_collapseBtn,getChildIndex(_loc1_));
         removeChild(_loc1_);
         layout();
         _dirty = true;
      }

      private function savedCollapsed() : Boolean
      {
         try
         {
            return SharedObject.getLocal("denLayers").data.collapsed == true;
         }
         catch(e:Error)
         {
         }
         return false;
      }

      private function saveCollapsed(param1:Boolean) : void
      {
         try
         {
            var _loc2_:SharedObject = SharedObject.getLocal("denLayers");
            _loc2_.data.collapsed = param1;
            _loc2_.flush();
         }
         catch(e:Error)
         {
         }
      }

      // the panel's size: from the top of the screen to above the den
      // editor's tabs
      private function layout() : void
      {
         var _loc1_:Number = _bottom != null ? Number(_bottom()) : 410;
         var _loc2_:Number = Math.max(HEAD + FOOT + ROW * 4 + 20,_loc1_ - Y);
         var _loc3_:Graphics = _frame.graphics;
         _loc3_.clear();
         if(_collapsed)
         {
            DenUi.woodBox(_loc3_,W,HEAD,4);
            DenUi.titleStrip(_loc3_,8,6,W - 42,24);
            _body.visible = false;
            _countTxt.x = _titleTxt.x + _titleTxt.width + 6;
            return;
         }
         _body.visible = true;
         DenUi.woodBox(_loc3_,W,_loc2_,INSET);
         DenUi.titleStrip(_loc3_,8,6,W - 42,24);
         _countTxt.x = _titleTxt.x + _titleTxt.width + 6;
         _listH = _loc2_ - HEAD - FOOT - INSET - 4;
         _listMask.graphics.clear();
         _listMask.graphics.beginFill(0);
         _listMask.graphics.drawRect(LIST_X,HEAD,LIST_W,_listH);
         _listMask.graphics.endFill();
         // the list's own inset, a little darker
         _loc3_.lineStyle(1,0xB89B5E);
         _loc3_.beginFill(DenUi.CREAM_LIGHT,0.55);
         _loc3_.drawRoundRect(LIST_X - 2,HEAD - 2,LIST_W + 16,_listH + 4,10,10);
         _loc3_.endFill();
         _loc3_.lineStyle();
         _scrollTrack.x = LIST_X + LIST_W + 3;
         _scrollTrack.y = HEAD;
         _scrollTrack.graphics.clear();
         _scrollTrack.graphics.beginFill(0xC9A86A,0.6);
         _scrollTrack.graphics.drawRoundRect(0,0,8,_listH,8,8);
         _scrollTrack.graphics.endFill();
         _foot.x = INSET + 4;
         _foot.y = HEAD + _listH + 6;
         var _loc4_:int = Math.ceil(_listH / ROW) + 1;
         while(_rows.length < _loc4_)
         {
            var _loc5_:Sprite = new Sprite();
            _loc5_.mouseEnabled = false;
            _loc5_.mouseChildren = false;
            var _loc6_:Bitmap = new Bitmap();
            _loc6_.name = "thumb";
            _loc5_.addChild(_loc6_);
            var _loc7_:TextField = DenUi.text("",12,DenUi.TEXT);
            _loc7_.name = "label";
            _loc5_.addChild(_loc7_);
            var _loc8_:Shape = new Shape();
            _loc8_.name = "icons";
            _loc5_.addChild(_loc8_);
            _list.addChild(_loc5_);
            _rows.push(_loc5_);
         }
         while(_rows.length > _loc4_)
         {
            _list.removeChild(_rows.pop());
         }
      }

      // ---- the model: what the list shows ----

      private function onChanged(param1:DenItemHolderEvent) : void
      {
         _dirty = true;
         // the pick bar at once, whatever the list's redrawing comes to
         updatePickBar();
      }

      private function onPoll(param1:TimerEvent) : void
      {
         if(!_shown || _dragging)
         {
            return;
         }
         var _loc2_:String = signature();
         if(_loc2_ != _signature)
         {
            _dirty = true;
         }
      }

      private function onFrame(param1:Event) : void
      {
         if(!_shown)
         {
            return;
         }
         if(_dragging)
         {
            dragScroll();
            return;
         }
         if(_dirty)
         {
            _dirty = false;
            rebuild();
         }
      }

      private function bandOf(param1:DenStateItem) : int
      {
         return _holder.isFloorItem(param1) ? -1 : DenItemHolder.depthOf(param1.flipped);
      }

      private function bandRank(param1:int) : int
      {
         return BANDS.indexOf(param1);
      }

      // the order things are in now, to see when it changes
      private function signature() : String
      {
         var _loc1_:Array = [];
         var _loc2_:Array = _holder.layerItems;
         var _loc3_:Object = {};
         for each(var _loc4_:DenStateItem in _loc2_)
         {
            _loc3_[_loc4_.invIdx + ":" + _loc4_.refId] = _holder.depthKey(_loc4_);
         }
         _loc2_.sort(function(param1:DenStateItem, param2:DenStateItem):int
         {
            var _loc9_:Number = _loc3_[param2.invIdx + ":" + param2.refId] - _loc3_[param1.invIdx + ":" + param1.refId];
            return _loc9_ > 0 ? 1 : (_loc9_ < 0 ? -1 : 0);
         });
         for each(_loc4_ in _loc2_)
         {
            _loc1_.push(_loc4_.invIdx + "." + _loc4_.flipped + "." + _loc4_.version);
         }
         var _loc5_:DenStateItem = _holder.selectedItem;
         return _loc1_.join(",") + "|" + (_loc5_ ? _loc5_.invIdx : -1) + "|" + _holder.pickedItems.length;
      }

      private function rebuild() : void
      {
         var _loc1_:DenStateItem = null;
         var _loc2_:int = 0;
         var _loc3_:Array = _holder.layerItems;
         var _loc4_:Dictionary = new Dictionary();
         for each(_loc1_ in _loc3_)
         {
            _loc4_[_loc1_] = _holder.depthKey(_loc1_);
         }
         var _loc5_:Function = function(param1:DenStateItem, param2:DenStateItem):int
         {
            var _loc10_:int = bandRank(bandOf(param1)) - bandRank(bandOf(param2));
            if(_loc10_ != 0)
            {
               return _loc10_;
            }
            var _loc11_:Number = _loc4_[param2] - _loc4_[param1];
            return _loc11_ > 0 ? 1 : (_loc11_ < 0 ? -1 : 0);
         };
         _loc3_.sort(_loc5_);
         _bandItems = {};
         for each(var _loc6_:int in BANDS)
         {
            _bandItems[_loc6_] = [];
         }
         for each(_loc1_ in _loc3_)
         {
            _bandItems[bandOf(_loc1_)].push(_loc1_);
         }
         _entries = [];
         var _loc7_:Object = {};
         for each(_loc6_ in BANDS)
         {
            _entries.push({
               "kind":"band",
               "band":_loc6_
            });
            for each(_loc1_ in _bandItems[_loc6_])
            {
               _loc2_ = _holder.groupIdOf(_loc1_);
               if(_loc2_ != 0 && _holder.canGroup(_loc1_))
               {
                  if(_loc7_[_loc2_])
                  {
                     continue;
                  }
                  _loc7_[_loc2_] = true;
                  var _loc8_:Array = _holder.groupMembers(_loc2_);
                  _loc8_.sort(_loc5_);
                  _entries.push({
                     "kind":"group",
                     "gid":_loc2_,
                     "band":_loc6_,
                     "members":_loc8_
                  });
                  if(_expanded[_loc2_])
                  {
                     for each(var _loc9_:DenStateItem in _loc8_)
                     {
                        _entries.push({
                           "kind":"item",
                           "item":_loc9_,
                           "gid":_loc2_,
                           "indent":1,
                           "band":bandOf(_loc9_)
                        });
                     }
                  }
               }
               else
               {
                  _entries.push({
                     "kind":"item",
                     "item":_loc1_,
                     "gid":0,
                     "indent":0,
                     "band":_loc6_
                  });
               }
            }
         }
         _countTxt.text = "(" + _loc3_.length + ")";
         _signature = signature();
         clampScroll();
         drawRows();
         drawFoot();
         updatePickBar();
      }

      // ---- drawing ----

      private function clampScroll() : void
      {
         _scroll = Math.max(0,Math.min(_scroll,_entries.length * ROW - _listH));
      }

      private function drawRows() : void
      {
         if(_collapsed)
         {
            return;
         }
         var _loc1_:int = Math.floor(_scroll / ROW);
         var _loc2_:int = 0;
         while(_loc2_ < _rows.length)
         {
            var _loc3_:Sprite = _rows[_loc2_];
            var _loc4_:int = _loc1_ + _loc2_;
            _loc3_.y = _loc4_ * ROW - _scroll;
            if(_loc4_ < _entries.length)
            {
               _loc3_.visible = true;
               drawRow(_loc3_,_entries[_loc4_],_loc4_);
            }
            else
            {
               _loc3_.visible = false;
            }
            _loc2_++;
         }
         drawScrollBar();
      }

      private function drawScrollBar() : void
      {
         var _loc1_:Number = _entries.length * ROW;
         _scrollThumb.graphics.clear();
         if(_loc1_ <= _listH)
         {
            _scrollThumb.visible = false;
            return;
         }
         _scrollThumb.visible = true;
         var _loc2_:Number = Math.max(24,_listH * _listH / _loc1_);
         _scrollThumb.x = _scrollTrack.x;
         _scrollThumb.y = HEAD + (_listH - _loc2_) * _scroll / (_loc1_ - _listH);
         _scrollThumb.graphics.lineStyle(1,DenUi.WOOD_DARK);
         _scrollThumb.graphics.beginFill(DenUi.WOOD_LIGHT);
         _scrollThumb.graphics.drawRoundRect(0,0,8,_loc2_,8,8);
         _scrollThumb.graphics.endFill();
      }

      private function drawRow(param1:Sprite, param2:Object, param3:int) : void
      {
         var _loc4_:Graphics = param1.graphics;
         var _loc5_:TextField = TextField(param1.getChildByName("label"));
         var _loc6_:Bitmap = Bitmap(param1.getChildByName("thumb"));
         var _loc7_:Graphics = Shape(param1.getChildByName("icons")).graphics;
         var _loc8_:DenStateItem = param2.item;
         var _loc9_:Number = 0;
         _loc4_.clear();
         _loc7_.clear();
         _loc6_.bitmapData = null;
         if(param2.kind == "band")
         {
            _loc5_.textColor = DenUi.TEXT_SOFT;
            DenUi.fitText(_loc5_,String(BAND_NAMES[param2.band]).toUpperCase() + "  " + _bandItems[param2.band].length,LIST_W - 8);
            _loc5_.x = 4;
            _loc5_.y = 5;
            _loc4_.lineStyle(1,0xB89B5E);
            _loc4_.moveTo(2,ROW - 2);
            _loc4_.lineTo(LIST_W - 2,ROW - 2);
            _loc4_.lineStyle();
            if(_dragging && _dropGap >= 0 && bandAtGap(_dropGap) == param2.band && dropAllowed())
            {
               _loc4_.beginFill(DenUi.GOLD,0.35);
               _loc4_.drawRect(0,0,LIST_W,ROW - 2);
               _loc4_.endFill();
            }
            return;
         }
         var _loc10_:Boolean = false;
         var _loc11_:Boolean = false;
         var _loc12_:Boolean = false;
         var _loc13_:uint = (param3 & 1) ? 0xF1E2B8 : 0xF7EDCF;
         if(param2.kind == "group")
         {
            _loc10_ = _holder.selectedItem != null && param2.members.indexOf(_holder.selectedItem) >= 0;
            _loc11_ = allPicked(param2.members);
            _loc12_ = _holder.lockedItem(param2.members[0]);
         }
         else
         {
            _loc10_ = _holder.selectedItem == _loc8_;
            _loc11_ = _holder.isPickedItem(_loc8_);
            _loc12_ = _holder.lockedItem(_loc8_);
         }
         if(_loc11_)
         {
            _loc13_ = DenUi.PICK;
         }
         if(param3 == _hover && !_dragging)
         {
            _loc13_ = _loc11_ ? 0xFFF4A8 : 0xFFF8E2;
         }
         _loc4_.beginFill(_loc13_);
         _loc4_.drawRoundRect(0,0,LIST_W,ROW - 2,8,8);
         _loc4_.endFill();
         if(_loc10_)
         {
            _loc4_.lineStyle(2,DenUi.GOLD_DARK);
            _loc4_.drawRoundRect(1,1,LIST_W - 2,ROW - 4,8,8);
            _loc4_.lineStyle();
         }
         if(_dragging && param2.kind == "group" && _dropGroup == param2.gid)
         {
            _loc4_.lineStyle(2,DenUi.BLUE);
            _loc4_.drawRoundRect(1,1,LIST_W - 2,ROW - 4,8,8);
            _loc4_.lineStyle();
         }
         _loc9_ = 4 + (param2.indent ? 14 : 0);
         if(param2.kind == "group")
         {
            // open/shut arrow, then a chain: the group
            _loc7_.beginFill(DenUi.TEXT);
            if(_expanded[param2.gid])
            {
               _loc7_.moveTo(_loc9_,8);
               _loc7_.lineTo(_loc9_ + 9,8);
               _loc7_.lineTo(_loc9_ + 4.5,14);
            }
            else
            {
               _loc7_.moveTo(_loc9_ + 2,6);
               _loc7_.lineTo(_loc9_ + 8,11);
               _loc7_.lineTo(_loc9_ + 2,16);
            }
            _loc7_.endFill();
            _loc9_ += 13;
            drawChain(_loc7_,_loc9_ + 9,11,_holder.groupSelectsAsOne(param2.gid));
            _loc9_ += 22;
            _loc5_.textColor = DenUi.TEXT;
            DenUi.fitText(_loc5_,"Group " + param2.gid + "  (" + param2.members.length + ")",LIST_W - _loc9_ - 44);
         }
         else
         {
            _loc6_.bitmapData = thumbOf(_loc8_);
            _loc6_.x = _loc9_;
            _loc6_.y = 1;
            _loc9_ += 23;
            _loc5_.textColor = _loc12_ ? DenUi.TEXT_SOFT : DenUi.TEXT;
            var _loc14_:String = nameOf(_loc8_);
            if(param2.indent && param2.band != _entryBandOfGroup(param2.gid))
            {
               _loc14_ += "  [" + BAND_SHORT[param2.band] + "]";
            }
            DenUi.fitText(_loc5_,_loc14_,LIST_W - _loc9_ - 44);
         }
         _loc5_.x = _loc9_;
         _loc5_.y = 4;
         // on the right: player depth (not on the floor), then the lock
         if(param2.kind == "item" && param2.band != -1)
         {
            drawDepthIcon(_loc7_,LIST_W - 34,11,DenItemHolder.depthOf(_loc8_.flipped),_loc12_);
         }
         DenUi.drawLock(_loc7_,LIST_W - 11,12,_loc12_,_loc12_ ? DenUi.GOLD_DARK : 0xB89B5E);
      }

      private function _entryBandOfGroup(param1:int) : int
      {
         for each(var _loc2_:Object in _entries)
         {
            if(_loc2_.kind == "group" && _loc2_.gid == param1)
            {
               return _loc2_.band;
            }
         }
         return 0;
      }

      private function allPicked(param1:Array) : Boolean
      {
         for each(var _loc2_:DenStateItem in param1)
         {
            if(!_holder.isPickedItem(_loc2_))
            {
               return false;
            }
         }
         return param1.length > 0;
      }

      // a chain: whole when the group's items are chosen as one, broken when one by one
      private function drawChain(param1:Graphics, param2:Number, param3:Number, param4:Boolean) : void
      {
         param1.lineStyle(2,param4 ? DenUi.TEXT : 0xB89B5E);
         param1.drawRoundRect(param2 - 9,param3 - 3.5,10,7,7,7);
         if(param4)
         {
            param1.drawRoundRect(param2 - 1,param3 - 3.5,10,7,7,7);
         }
         else
         {
            param1.drawRoundRect(param2 + 2,param3 - 3.5,10,7,7,7);
         }
         param1.lineStyle();
      }

      // a player and a box: the box in front of the player (above players),
      // behind them (below players), or beside them (by where it stands)
      private function drawDepthIcon(param1:Graphics, param2:Number, param3:Number, param4:int, param5:Boolean) : void
      {
         var _loc6_:uint = param5 ? 0xC9B68A : (param4 == DenItemHolder.DEPTH_AUTO ? 0xA08860 : DenUi.BLUE);
         var _loc7_:uint = param5 ? 0xC9B68A : 0x7A5A3A;
         if(param4 == DenItemHolder.DEPTH_FRONT)
         {
            drawPerson(param1,param2 - 3,param3,_loc7_,false);
            param1.lineStyle(1.5,DenUi.CREAM_LIGHT);
            param1.beginFill(_loc6_);
            param1.drawRoundRect(param2 - 2,param3 - 1,9,8,3,3);
            param1.endFill();
            param1.lineStyle();
         }
         else if(param4 == DenItemHolder.DEPTH_BEHIND)
         {
            param1.beginFill(_loc6_);
            param1.drawRoundRect(param2 - 1,param3 - 6,9,8,3,3);
            param1.endFill();
            drawPerson(param1,param2 - 3,param3,_loc7_,true);
         }
         else
         {
            drawPerson(param1,param2 - 5,param3,_loc7_,false);
            param1.beginFill(_loc6_);
            param1.drawRoundRect(param2 + 1,param3 - 1,7,7,3,3);
            param1.endFill();
         }
      }

      // a little player: a head and shoulders, `param2`,`param3` its middle;
      // `param5` outlined, to stand out in front of something
      private function drawPerson(param1:Graphics, param2:Number, param3:Number, param4:uint, param5:Boolean) : void
      {
         if(param5)
         {
            param1.lineStyle(1.5,DenUi.CREAM_LIGHT);
         }
         param1.beginFill(param4);
         param1.drawCircle(param2,param3 - 4,2.8);
         param1.drawRoundRect(param2 - 4,param3 - 0.5,8,7,5,5);
         param1.endFill();
         param1.lineStyle();
      }

      // a little picture of the item, as it stands in the den
      private function thumbOf(param1:DenStateItem) : BitmapData
      {
         var _loc2_:Object = _thumbs[param1];
         if(_loc2_ != null && _loc2_.version == param1.version && _loc2_.flip == (param1.flipped & 3))
         {
            return _loc2_.bmp;
         }
         var _loc3_:BitmapData = new BitmapData(20,20,true,0);
         var _loc4_:DisplayObject = param1.denItemHelper ? param1.denItemHelper.displayObject : null;
         if(_loc4_ != null)
         {
            try
            {
               var _loc5_:Rectangle = _loc4_.getBounds(_loc4_);
               if(_loc5_.width > 0 && _loc5_.height > 0)
               {
                  var _loc6_:Number = Math.min(20 / _loc5_.width,20 / _loc5_.height);
                  var _loc7_:Matrix = new Matrix();
                  _loc7_.translate(-_loc5_.x,-_loc5_.y);
                  _loc7_.scale(_loc6_,_loc6_);
                  _loc7_.translate((20 - _loc5_.width * _loc6_) * 0.5,(20 - _loc5_.height * _loc6_) * 0.5);
                  _loc3_.draw(_loc4_,_loc7_,null,null,null,true);
               }
               else
               {
                  _loc3_.dispose();
                  return null;
               }
            }
            catch(e:Error)
            {
               _loc3_.fillRect(new Rectangle(3,3,14,14),0xFFC9A86A);
            }
         }
         if(_loc2_ != null && _loc2_.bmp)
         {
            BitmapData(_loc2_.bmp).dispose();
         }
         _thumbs[param1] = {
            "bmp":_loc3_,
            "version":param1.version,
            "flip":param1.flipped & 3
         };
         return _loc3_;
      }

      // the item's name, as the den item list has it
      public function nameOf(param1:DenStateItem) : String
      {
         var _loc2_:String = param1.invIdx + ":" + param1.refId;
         if(_names[_loc2_] != null)
         {
            return _names[_loc2_];
         }
         var _loc3_:String = "";
         try
         {
            if(param1.petItem != null)
            {
               _loc3_ = PetItem(param1.petItem).name;
            }
            else
            {
               var _loc4_:DenItemCollection = gMainFrame.userInfo.playerUserInfo.denItemsFull;
               var _loc5_:int = 0;
               while(_loc4_ && _loc5_ < _loc4_.length)
               {
                  var _loc6_:DenItem = _loc4_.getDenItem(_loc5_);
                  if(_loc6_ && _loc6_.invIdx == param1.invIdx)
                  {
                     _loc3_ = _loc6_.name;
                     break;
                  }
                  _loc5_++;
               }
            }
         }
         catch(e:Error)
         {
         }
         if(_loc3_ == null || _loc3_ == "")
         {
            _loc3_ = param1.petItem != null ? "Pet" : "Den item";
         }
         _names[_loc2_] = _loc3_;
         return _loc3_;
      }

      // ---- what is chosen, under the list ----

      private function drawFoot() : void
      {
         while(_foot.numChildren > 0)
         {
            _foot.removeChildAt(0);
         }
         _foot.graphics.clear();
         if(_collapsed)
         {
            return;
         }
         var _loc1_:Number = W - INSET * 2 - 8;
         var _loc2_:DenStateItem = _holder.selectedItem;
         if(_loc2_ == null || _holder.layerItems.indexOf(_loc2_) < 0)
         {
            var _loc3_:TextField = DenUi.text("Click a row to choose its item.\nShift+click rows or items to pick several.\nDrag rows to put items in front of or\nbehind others.",11,DenUi.TEXT_SOFT,false);
            _loc3_.x = 2;
            _loc3_.y = 4;
            _foot.addChild(_loc3_);
            return;
         }
         var _loc4_:Boolean = _holder.lockedItem(_loc2_);
         var _loc5_:int = _holder.groupIdOf(_loc2_);
         var _loc6_:TextField = DenUi.text("",13,DenUi.TEXT);
         DenUi.fitText(_loc6_,nameOf(_loc2_) + (_loc5_ != 0 ? "  - Group " + _loc5_ : ""),_loc1_ - 4);
         _loc6_.x = 2;
         _loc6_.y = 0;
         _foot.addChild(_loc6_);
         // its colour
         var _loc7_:Array = _holder.versionsOf(_loc2_);
         var _loc8_:Number = 22;
         if(_loc7_ != null && _loc7_.length > 1 && !_loc4_)
         {
            var _loc9_:int = Math.max(0,_loc7_.indexOf(_loc2_.version));
            var _loc10_:Sprite = DenUi.roundButton(9,drawLeft,function():void
            {
               recolour(_loc2_,_loc7_[(_loc9_ + _loc7_.length - 1) % _loc7_.length]);
            });
            _loc10_.x = 11;
            _loc10_.y = _loc8_ + 11;
            _foot.addChild(_loc10_);
            var _loc11_:TextField = DenUi.text("Colour " + (_loc9_ + 1) + " of " + _loc7_.length,12,DenUi.TEXT);
            _loc11_.x = 24;
            _loc11_.y = _loc8_ + 3;
            _foot.addChild(_loc11_);
            var _loc12_:Sprite = DenUi.roundButton(9,drawRight,function():void
            {
               recolour(_loc2_,_loc7_[(_loc9_ + 1) % _loc7_.length]);
            });
            _loc12_.x = _loc11_.x + _loc11_.width + 13;
            _loc12_.y = _loc8_ + 11;
            _foot.addChild(_loc12_);
            DenUi.setEnabled(_loc10_,!_colourPending);
            DenUi.setEnabled(_loc12_,!_colourPending);
         }
         else
         {
            var _loc13_:TextField = DenUi.text(_loc4_ ? "Locked: unlock it to change it." : "This item has one colour.",11,DenUi.TEXT_SOFT,false);
            _loc13_.x = 2;
            _loc13_.y = _loc8_ + 4;
            _foot.addChild(_loc13_);
         }
         // buttons
         var _loc14_:Number = (_loc1_ - 8) / 3;
         var _loc15_:Sprite = DenUi.bluePill("Bring here",_loc14_,function():void
         {
            _holder.bringToView(_loc2_);
         },24);
         DenUi.setEnabled(_loc15_,!_loc4_);
         var _loc16_:Sprite = DenUi.goldPill(_loc4_ ? "Unlock" : "Lock",_loc14_,function():void
         {
            _holder.setLocked(sameAs(_loc2_),!_loc4_);
            _holder.selectItem(_loc2_);
         },24);
         var _loc17_:Sprite = null;
         if(_loc5_ != 0)
         {
            var _loc18_:Boolean = _holder.groupSelectsAsOne(_loc5_);
            _loc17_ = DenUi.greenPill(_loc18_ ? "As one: on" : "As one: off",_loc14_,function():void
            {
               _holder.setGroupSelectsAsOne(_loc5_,!_loc18_);
            },24);
            if(!_loc18_)
            {
               DenUi.drawPill(_loc17_.graphics,_loc14_,24,0xD8C79A,0xB59E6A,0x7A6640);
            }
         }
         else
         {
            _loc17_ = DenUi.greenPill(DEPTH_PILL[DenItemHolder.depthOf(_loc2_.flipped)],_loc14_,function():void
            {
               _holder.setDepth([_loc2_],(DenItemHolder.depthOf(_loc2_.flipped) + 1) % 3);
            },24);
            DenUi.setEnabled(_loc17_,!_loc4_ && !_holder.isFloorItem(_loc2_));
         }
         var _loc19_:int = 0;
         for each(var _loc20_:Sprite in [_loc15_,_loc16_,_loc17_])
         {
            _loc20_.x = 2 + _loc19_ * (_loc14_ + 4);
            _loc20_.y = _loc8_ + 30;
            _foot.addChild(_loc20_);
            _loc19_++;
         }
      }

      // what a lock from the panel goes to: the item's group when it is
      // chosen as one, the picked items when it is one of them, else itself
      private function sameAs(param1:DenStateItem) : Array
      {
         var _loc2_:Array = _holder.pickedItems;
         if(_loc2_.indexOf(param1) >= 0)
         {
            return _loc2_;
         }
         var _loc3_:int = _holder.groupIdOf(param1);
         if(_loc3_ != 0 && _holder.groupSelectsAsOne(_loc3_))
         {
            return _holder.groupMembers(_loc3_);
         }
         return [param1];
      }

      private function drawLeft(param1:Graphics, param2:Number) : void
      {
         param1.beginFill(0xFFFFFF);
         param1.moveTo(3,-4);
         param1.lineTo(3,4);
         param1.lineTo(-4,0);
         param1.endFill();
      }

      private function drawRight(param1:Graphics, param2:Number) : void
      {
         param1.beginFill(0xFFFFFF);
         param1.moveTo(-3,-4);
         param1.lineTo(-3,4);
         param1.lineTo(4,0);
         param1.endFill();
      }

      private function recolour(param1:DenStateItem, param2:int) : void
      {
         if(_colourPending || _holder.lockedItem(param1))
         {
            return;
         }
         _colourPending = true;
         DenXtCommManager.requestItemColour(param1.invIdx,param2);
         drawFoot();
      }

      // the server's answer to a colour change ("dvc")
      public function colourChanged() : void
      {
         _colourPending = false;
         _dirty = true;
      }

      // ---- the pick bar ----

      // the bar of what was Shift+clicked: how many, the buttons in a row in
      // the middle, and how to pick more underneath
      private function buildPickBar() : void
      {
         _pickBar = new Sprite();
         _pickBar.visible = false;
         _pickGroupBtn = DenUi.greenPill("Make group",96,onPickGroup,24);
         _pickLockBtn = DenUi.goldPill("Unlock",72,onPickLock,24);
         _pickPrefabBtn = DenUi.bluePill("Save prefab",96,onPickPrefab,24);
         _pickDuplicateBtn = DenUi.goldPill("Duplicate",86,onPickDuplicate,24);
         _pickGridBtn = DenUi.greenPill("Grid",60,onPickGrid,24);
         _pickClearBtn = DenUi.redPill("Clear",60,onPickClear,24);
         var _loc1_:Array = [_pickGroupBtn,_pickGridBtn,_pickLockBtn,_pickDuplicateBtn,_pickPrefabBtn,_pickClearBtn];
         var _loc2_:Number = -8;
         for each(var _loc3_:Sprite in _loc1_)
         {
            _loc2_ += _loc3_.width + 8;
         }
         var _loc4_:Number = Math.max(330,_loc2_ + 40);
         DenUi.woodBox(_pickBar.graphics,_loc4_,PICK_H,6);
         _pickTxt = DenUi.text("",13,DenUi.TEXT);
         _pickTxt.y = 9;
         _pickBar.addChild(_pickTxt);
         var _loc5_:Number = int((_loc4_ - _loc2_) * 0.5);
         for each(_loc3_ in _loc1_)
         {
            _loc3_.x = _loc5_;
            _loc3_.y = 30;
            _pickBar.addChild(_loc3_);
            _loc5_ += _loc3_.width + 8;
         }
         var _loc6_:TextField = DenUi.text("Shift+click an item (or a row) to add it or take it off.",10,DenUi.TEXT_SOFT,false);
         _loc6_.x = int((_loc4_ - _loc6_.width) * 0.5);
         _loc6_.y = 60;
         _pickBar.addChild(_loc6_);
         _pickBar.addEventListener("mouseDown",DenUi.stop,false,0,true);
         _pickBar.addEventListener("mouseMove",onPickBarMove,false,0,true);
         _pickBar.addEventListener("click",DenUi.stop,false,0,true);
      }

      private function onPickBarMove(param1:MouseEvent) : void
      {
         param1.stopPropagation();
      }

      private function updatePickBar() : void
      {
         var _loc1_:Array = _holder.pickedItems;
         _pickBar.visible = _shown && _holder.inEditMode && _loc1_.length > 0;
         if(!_pickBar.visible)
         {
            return;
         }
         _pickTxt.text = _loc1_.length == 1 ? "1 item picked" : _loc1_.length + " items picked";
         _pickTxt.x = int((_pickBar.width - _pickTxt.width) * 0.5);
         var _loc2_:Boolean = true;
         for each(var _loc3_:DenStateItem in _loc1_)
         {
            if(!_holder.lockedItem(_loc3_))
            {
               _loc2_ = false;
            }
         }
         TextField(_pickLockBtn.getChildAt(0)).text = _loc2_ ? "Unlock" : "Lock";
         DenUi.setEnabled(_pickGroupBtn,_loc1_.length >= 2 && !alreadyOneGroup(_loc1_));
         DenUi.setEnabled(_pickGridBtn,_loc1_.length >= 2);
         var _loc4_:Number = _bottom != null ? Number(_bottom()) : 410;
         _pickBar.x = int(Math.max(X + W + 10,(900 - _pickBar.width) * 0.5 + 60));
         _pickBar.y = int(_loc4_ - PICK_H - 10);
      }

      // are the picked items one group already, all of it?
      private function alreadyOneGroup(param1:Array) : Boolean
      {
         var _loc2_:int = _holder.groupIdOf(param1[0]);
         if(_loc2_ == 0)
         {
            return false;
         }
         for each(var _loc3_:DenStateItem in param1)
         {
            if(_holder.groupIdOf(_loc3_) != _loc2_)
            {
               return false;
            }
         }
         return _holder.groupMembers(_loc2_).length == param1.length;
      }

      private function onPickGroup() : void
      {
         var _loc1_:Array = _holder.pickedItems;
         var _loc2_:int = _holder.makeGroup(_loc1_);
         if(_loc2_ != 0)
         {
            _expanded[_loc2_] = false;
            _holder.selectItem(_loc1_[0]);
         }
      }

      private function onPickLock() : void
      {
         var _loc1_:Array = _holder.pickedItems;
         var _loc2_:Boolean = true;
         for each(var _loc3_:DenStateItem in _loc1_)
         {
            if(!_holder.lockedItem(_loc3_))
            {
               _loc2_ = false;
            }
         }
         _holder.setLocked(_loc1_,!_loc2_);
      }

      private function onPickPrefab() : void
      {
         if(_onSavePrefab != null)
         {
            _onSavePrefab(_holder.pickedItems);
         }
      }

      // the picked items in a grid, as one group: for a picture made of
      // several items. asks how many across (and, after it, a gap)
      private function onPickGrid() : void
      {
         var _loc1_:Array = _holder.pickedItems;
         if(_loc1_.length < 2)
         {
            return;
         }
         var _loc2_:int = Math.ceil(Math.sqrt(_loc1_.length));
         DenUi.prompt(_layer,"Grid","Set the " + _loc1_.length + " picked items edge to edge, then make them one group.\nHow many across? (Add a second number for a gap in pixels, as in 3 2.)",String(_loc2_),[["Arrange","green",function(param1:String):void
         {
            var _loc2_:Array = param1.match(/\d+/g);
            if(_loc2_ == null || _loc2_.length == 0 || int(_loc2_[0]) < 1)
            {
               return;
            }
            var _loc3_:int = _holder.arrangeGrid(_loc4_,int(_loc2_[0]),_loc2_.length > 1 ? Math.min(200,int(_loc2_[1])) : 0);
            if(_loc3_ != 0)
            {
               _expanded[_loc3_] = false;
               _holder.selectItem(_loc4_[0]);
            }
         }],["Cancel","red",null]],10);
         var _loc4_:Array = _loc1_;
      }

      private function onPickDuplicate() : void
      {
         if(_onDuplicate != null)
         {
            _onDuplicate(_holder.pickedItems);
         }
      }

      private function onPickClear() : void
      {
         _holder.clearPicks();
      }

      // ---- the mouse on the panel ----

      private function rowAt(param1:Number) : int
      {
         var _loc2_:Number = param1 - HEAD + _scroll;
         if(param1 < HEAD || param1 > HEAD + _listH)
         {
            return -1;
         }
         var _loc3_:int = Math.floor(_loc2_ / ROW);
         return _loc3_ < _entries.length ? _loc3_ : -1;
      }

      private function zoneAt(param1:Object, param2:Number) : String
      {
         var _loc3_:Number = param2 - LIST_X;
         if(param1.kind == "band")
         {
            return "none";
         }
         if(_loc3_ > LIST_W - 22)
         {
            return "lock";
         }
         if(param1.kind == "item" && param1.band != -1 && _loc3_ > LIST_W - 44)
         {
            return "depth";
         }
         var _loc4_:Number = 4 + (param1.indent ? 14 : 0);
         if(param1.kind == "group")
         {
            if(_loc3_ < _loc4_ + 13)
            {
               return "expand";
            }
            if(_loc3_ < _loc4_ + 35)
            {
               return "asone";
            }
         }
         return "main";
      }

      private function onMouseDown(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         if(_collapsed)
         {
            return;
         }
         var _loc2_:Point = globalToLocal(new Point(param1.stageX,param1.stageY));
         if(_loc2_.x >= _scrollTrack.x && _loc2_.x <= _scrollTrack.x + 10 && _loc2_.y >= HEAD && _loc2_.y <= HEAD + _listH)
         {
            _scrollDrag = _loc2_.y;
            beginPress();
            scrollTo(_loc2_.y);
            return;
         }
         _down = rowAt(_loc2_.y);
         if(_down < 0 || _loc2_.x < LIST_X || _loc2_.x > LIST_X + LIST_W)
         {
            _down = -1;
            return;
         }
         _downZone = zoneAt(_entries[_down],_loc2_.x);
         _downPoint = _loc2_;
         _downShift = param1.shiftKey;
         beginPress();
      }

      private function beginPress() : void
      {
         gMainFrame.stage.addEventListener("mouseMove",onStageMove,true,0,true);
         gMainFrame.stage.addEventListener("mouseUp",onStageUp,true,0,true);
      }

      private function endPress() : void
      {
         gMainFrame.stage.removeEventListener("mouseMove",onStageMove,true);
         gMainFrame.stage.removeEventListener("mouseUp",onStageUp,true);
         _down = -1;
         _scrollDrag = -1;
         _dragging = false;
         _dropGap = -1;
         _dropGroup = 0;
         _ghost.visible = false;
         _dropLine.visible = false;
      }

      private function scrollTo(param1:Number) : void
      {
         var _loc2_:Number = _entries.length * ROW - _listH;
         if(_loc2_ <= 0)
         {
            return;
         }
         _scroll = Math.max(0,Math.min(_loc2_,(param1 - HEAD) / _listH * _loc2_));
         drawRows();
      }

      private function onStageMove(param1:MouseEvent) : void
      {
         var _loc2_:Point = globalToLocal(new Point(param1.stageX,param1.stageY));
         if(_scrollDrag >= 0)
         {
            scrollTo(_loc2_.y);
            return;
         }
         if(_down < 0)
         {
            return;
         }
         if(!_dragging)
         {
            var _loc3_:Object = _entries[_down];
            if(_downZone != "main" || _loc3_.kind == "band" || Point.distance(_loc2_,_downPoint) < 5)
            {
               return;
            }
            if(_loc3_.kind == "item" && _holder.lockedItem(_loc3_.item) || _loc3_.kind == "group" && _holder.lockedItem(_loc3_.members[0]))
            {
               return;
            }
            _dragging = true;
            _holder.setPreview(null);
            drawGhost(_loc3_);
         }
         _ghost.visible = true;
         _ghost.x = LIST_X;
         _ghost.y = _loc2_.y - ROW * 0.5;
         findDrop(_loc2_);
         drawRows();
      }

      private function drawGhost(param1:Object) : void
      {
         while(_ghost.numChildren > 0)
         {
            _ghost.removeChildAt(0);
         }
         // a row of its own for the ghost: a copy of how the row looks
         var _loc4_:BitmapData = new BitmapData(LIST_W,ROW,true,0);
         var _loc5_:Sprite = new Sprite();
         var _loc6_:Bitmap = new Bitmap();
         _loc6_.name = "thumb";
         _loc5_.addChild(_loc6_);
         var _loc7_:TextField = DenUi.text("",12,DenUi.TEXT);
         _loc7_.name = "label";
         _loc5_.addChild(_loc7_);
         var _loc8_:Shape = new Shape();
         _loc8_.name = "icons";
         _loc5_.addChild(_loc8_);
         drawRow(_loc5_,param1,-2);
         _loc4_.draw(_loc5_);
         _ghost.addChild(new Bitmap(_loc4_));
         _ghost.graphics.clear();
         _ghost.graphics.lineStyle(2,DenUi.GOLD_DARK);
         _ghost.graphics.drawRoundRect(0,0,LIST_W,ROW - 2,8,8);
      }

      // where a drop would go: a gap between rows (before entry `_dropGap`)
      // and the group whose block that is in, or a group's row itself
      private function findDrop(param1:Point) : void
      {
         var _loc2_:Number = param1.y - HEAD + _scroll;
         var _loc3_:Object = _entries[_down];
         _dropGroup = 0;
         var _loc4_:int = Math.floor(_loc2_ / ROW);
         var _loc5_:Number = _loc2_ - _loc4_ * ROW;
         if(_loc4_ >= 0 && _loc4_ < _entries.length && _entries[_loc4_].kind == "group" && _loc3_.kind == "item" && _loc5_ > ROW * 0.25 && _loc5_ < ROW * 0.75 && _entries[_loc4_].gid != _loc3_.gid)
         {
            // onto a group's row: into that group, in front of its items
            _dropGroup = _entries[_loc4_].gid;
            _dropGap = _loc4_ + 1;
            _dropLine.visible = false;
            return;
         }
         _dropGap = Math.max(1,Math.min(_entries.length,Math.round(_loc2_ / ROW)));
         _dropGroup = groupAtGap(_dropGap);
         _dropLine.visible = dropAllowed();
         _dropLine.graphics.clear();
         _dropLine.graphics.lineStyle(3,DenUi.GOLD_DARK);
         var _loc6_:Number = HEAD + _dropGap * ROW - _scroll - 1;
         _dropLine.graphics.moveTo(LIST_X + (_dropGroup != 0 ? 14 : 0),_loc6_);
         _dropLine.graphics.lineTo(LIST_X + LIST_W,_loc6_);
      }

      // the band the gap is in: that of the nearest band row above it
      private function bandAtGap(param1:int) : int
      {
         var _loc2_:int = param1 - 1;
         while(_loc2_ >= 0)
         {
            if(_entries[_loc2_].kind == "band")
            {
               return _entries[_loc2_].band;
            }
            _loc2_--;
         }
         return DenItemHolder.DEPTH_FRONT;
      }

      // the open group whose rows are on both sides of the gap (or 0)
      private function groupAtGap(param1:int) : int
      {
         var _loc2_:Object = param1 - 1 >= 0 ? _entries[param1 - 1] : null;
         var _loc3_:Object = param1 < _entries.length ? _entries[param1] : null;
         if(_loc2_ == null)
         {
            return 0;
         }
         var _loc4_:int = _loc2_.kind == "group" ? int(_loc2_.gid) : (_loc2_.kind == "item" && _loc2_.indent ? int(_loc2_.gid) : 0);
         if(_loc4_ == 0)
         {
            return 0;
         }
         if(_loc2_.kind == "group" && _expanded[_loc4_] || _loc3_ != null && _loc3_.kind == "item" && _loc3_.indent && _loc3_.gid == _loc4_)
         {
            return _loc4_;
         }
         return 0;
      }

      // what is being dragged: its items
      private function draggedItems() : Array
      {
         var _loc1_:Object = _entries[_down];
         if(_loc1_ == null)
         {
            return [];
         }
         return _loc1_.kind == "group" ? (_loc1_.members as Array).concat() : [_loc1_.item];
      }

      // floor items stay on the floor and the rest off it
      private function dropAllowed() : Boolean
      {
         if(_dropGap < 0 || _down < 0)
         {
            return false;
         }
         var _loc1_:int = _dropGroup != 0 ? groupBand(_dropGroup) : bandAtGap(_dropGap);
         for each(var _loc2_:DenStateItem in draggedItems())
         {
            if(_holder.isFloorItem(_loc2_) == (_loc1_ == -1))
            {
               return true;
            }
         }
         return false;
      }

      private function groupBand(param1:int) : int
      {
         var _loc2_:int = 0;
         while(_loc2_ < _entries.length)
         {
            if(_entries[_loc2_].kind == "group" && _entries[_loc2_].gid == param1)
            {
               return bandAtGap(_loc2_ + 1);
            }
            _loc2_++;
         }
         return 0;
      }

      private function onStageUp(param1:MouseEvent) : void
      {
         var _loc2_:Object = _down >= 0 ? _entries[_down] : null;
         var _loc3_:Boolean = _dragging;
         if(_loc3_)
         {
            drop();
         }
         var _loc4_:String = _downZone;
         var _loc5_:Boolean = _downShift;
         endPress();
         if(!_loc3_ && _loc2_ != null)
         {
            click(_loc2_,_loc4_,_loc5_);
         }
         _dirty = true;
      }

      private function click(param1:Object, param2:String, param3:Boolean) : void
      {
         var _loc4_:Array = null;
         var _loc5_:DenStateItem = param1.item;
         if(param1.kind == "band")
         {
            return;
         }
         AJAudio.playSubMenuBtnClick();
         switch(param2)
         {
            case "expand":
               _expanded[param1.gid] = !_expanded[param1.gid];
               break;
            case "asone":
               _holder.setGroupSelectsAsOne(param1.gid,!_holder.groupSelectsAsOne(param1.gid));
               break;
            case "lock":
               _loc4_ = param1.kind == "group" ? param1.members : sameAs(_loc5_);
               _holder.setLocked(_loc4_,!_holder.lockedItem(_loc4_[0]));
               _holder.selectItem(_loc4_[0]);
               break;
            case "depth":
               if(!_holder.lockedItem(_loc5_))
               {
                  _holder.setDepth(sameAs(_loc5_),(DenItemHolder.depthOf(_loc5_.flipped) + 1) % 3);
               }
               break;
            default:
               if(param1.kind == "group")
               {
                  if(param3)
                  {
                     _holder.setPicked(_holder.pickedItems.concat(param1.members));
                  }
                  else
                  {
                     _holder.pickGroup(param1.gid);
                  }
               }
               else if(param3)
               {
                  _holder.togglePick(_loc5_);
               }
               else
               {
                  _holder.selectItem(_loc5_);
               }
         }
      }

      // the dragged rows put where they were dropped
      private function drop() : void
      {
         if(!dropAllowed())
         {
            return;
         }
         var _loc1_:Object = _entries[_down];
         var _loc2_:int = _dropGroup != 0 ? groupBand(_dropGroup) : bandAtGap(_dropGap);
         var _loc3_:Array = [];
         var _loc4_:DenStateItem = null;
         for each(_loc4_ in draggedItems())
         {
            if(_holder.isFloorItem(_loc4_) == (_loc2_ == -1))
            {
               _loc3_.push(_loc4_);
            }
         }
         // into or out of a group
         if(_loc1_.kind == "item")
         {
            _loc4_ = _loc1_.item;
            if(_dropGroup != 0 && _holder.groupIdOf(_loc4_) != _dropGroup)
            {
               _holder.setItemGroup(_loc4_,_dropGroup);
            }
            else if(_dropGroup == 0 && _holder.groupIdOf(_loc4_) != 0 && _loc1_.indent)
            {
               _holder.setItemGroup(_loc4_,0);
            }
         }
         // the band's order with them put in: after the nearest item of the
         // band above the gap that is not being moved
         var _loc5_:Array = (_bandItems[_loc2_] as Array).filter(function(param1:DenStateItem, param2:int, param3:Array):Boolean
         {
            return _loc3_.indexOf(param1) < 0;
         });
         var _loc6_:int = 0;
         var _loc7_:int = _dropGap - 1;
         while(_loc7_ >= 0)
         {
            var _loc8_:Object = _entries[_loc7_];
            if(_loc8_.kind == "band")
            {
               break;
            }
            var _loc9_:Array = _loc8_.kind == "group" ? [] : [_loc8_.item];
            if(_loc8_.kind == "group" && !_expanded[_loc8_.gid])
            {
               // a shut group: after the last of its items in this band
               _loc9_ = (_loc8_.members as Array).concat().reverse();
            }
            var _loc10_:Boolean = false;
            for each(var _loc11_:DenStateItem in _loc9_)
            {
               var _loc12_:int = _loc5_.indexOf(_loc11_);
               if(_loc12_ >= 0)
               {
                  _loc6_ = _loc12_ + 1;
                  _loc10_ = true;
                  break;
               }
            }
            if(_loc10_)
            {
               break;
            }
            _loc7_--;
         }
         var _loc13_:Array = _loc5_.slice(0,_loc6_).concat(_loc3_,_loc5_.slice(_loc6_));
         _holder.applyOrder(_loc13_,_loc3_,_loc2_);
      }

      private function onMouseMove(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         if(_down >= 0 || _scrollDrag >= 0 || _collapsed)
         {
            return;
         }
         var _loc2_:Point = globalToLocal(new Point(param1.stageX,param1.stageY));
         var _loc3_:int = _loc2_.x >= LIST_X && _loc2_.x <= LIST_X + LIST_W ? rowAt(_loc2_.y) : -1;
         if(_loc3_ != _hover)
         {
            _hover = _loc3_;
            var _loc4_:Object = _loc3_ >= 0 ? _entries[_loc3_] : null;
            _holder.setPreview(_loc4_ && _loc4_.kind == "item" ? _loc4_.item : null);
            drawRows();
         }
      }

      private function onRollOut(param1:MouseEvent) : void
      {
         if(_hover != -1)
         {
            _hover = -1;
            _holder.setPreview(null);
            drawRows();
         }
      }

      private function onWheel(param1:MouseEvent) : void
      {
         param1.stopPropagation();
         _scroll -= param1.delta * ROW;
         clampScroll();
         drawRows();
      }

      // dragging near the list's top or bottom scrolls it
      private function dragScroll() : void
      {
         var _loc1_:Number = mouseY;
         var _loc2_:Number = 0;
         if(_loc1_ < HEAD + 12)
         {
            _loc2_ = -8;
         }
         else if(_loc1_ > HEAD + _listH - 12)
         {
            _loc2_ = 8;
         }
         if(_loc2_ != 0)
         {
            var _loc3_:Number = _scroll;
            _scroll += _loc2_;
            clampScroll();
            if(_scroll != _loc3_)
            {
               findDrop(new Point(mouseX,mouseY));
               drawRows();
            }
         }
      }
   }
}
