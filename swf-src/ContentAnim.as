package loader
{
   import com.sbi.corelib.audio.SBAudio;
   import flash.display.Bitmap;
   import flash.display.BitmapData;
   import flash.display.DisplayObject;
   import flash.display.Loader;
   import flash.display.Sprite;
   import flash.events.Event;
   import flash.events.MouseEvent;
   import flash.geom.Rectangle;
   import flash.media.Sound;
   import flash.media.SoundChannel;
   import flash.media.SoundTransform;
   import flash.net.URLRequest;
   import flash.system.LoaderContext;
   import flash.utils.getTimer;

   // a LINE PLAY content shop item's animation and music (this server:
   // lib/contentpacks.js gives them as "lpa" in the item's file, made by
   // tools/content/lineplay/animate.py). the item's file is its still
   // picture, which is the animation's first frame; the frames are one
   // picture in a grid (/itemanim/den/<id>.png) and the music an mp3
   // (/itemsound/den/<id>.mp3), both fetched the first time it plays.
   //
   // its owner chooses in the den editor's layers panel (gui.DenLayersPanel)
   // whether it plays when clicked (click again to stop), while the mouse is
   // on it, or never, and whether its music plays. that is kept in the
   // placed item's version, which these items do not otherwise use: bits 0-1
   // the mode (0 on click, 1 on hover, 2 off), bit 2 its music off. a new
   // item (version 0) plays on click, with its music. playing is for whoever
   // clicks: nobody else in the den sees or hears it.
   public class ContentAnim
   {
      public static const ON_CLICK:int = 0;

      public static const ON_HOVER:int = 1;

      public static const OFF:int = 2;

      public static const MODE_MASK:int = 3;

      public static const MUTE_BIT:int = 4;

      public static const MODE_LABELS:Array = ["Plays: on click","Plays: on hover","Plays: never"];

      // the frames' pictures by address (one is shared by every copy of the
      // item); past SHEETS_MAX it starts afresh
      private static const SHEETS_MAX:int = 8;

      private static var _sheets:Object = {};

      private static var _sheetCount:int = 0;

      private static var _sheetWaiting:Object = {};

      private static var _sounds:Object = {};

      // one item's music plays at a time
      private static var _musicOwner:ContentAnim = null;

      private static var _musicChannel:SoundChannel = null;

      private var _defId:int;

      private var _frames:int;

      private var _cols:int;

      private var _w:int;

      private var _h:int;

      private var _x:int;

      private var _y:int;

      // when each frame ends, in ms from the start of the loop
      private var _ends:Array = [];

      private var _loopMs:int = 1;

      private var _hasMusic:Boolean;

      private var _tag:String;

      private var _host:Sprite;

      private var _still:DisplayObject;

      private var _bmp:Bitmap;

      private var _wanted:Boolean;

      private var _shown:Boolean;

      private var _start:int;

      private var _frame:int = -1;

      public function ContentAnim()
      {
         super();
      }

      // "frames|cols|w|h|x|y|ms,ms,...|music|tag" (lib/contentpacks.js
      // animSpec), or null when it is not one, or has nothing to play
      public static function parse(param1:String, param2:int) : ContentAnim
      {
         var _loc3_:Array = param1 == null ? [] : param1.split("|");
         if(_loc3_.length < 9)
         {
            return null;
         }
         var _loc4_:ContentAnim = new ContentAnim();
         _loc4_._defId = param2;
         _loc4_._frames = int(_loc3_[0]);
         _loc4_._cols = int(_loc3_[1]);
         _loc4_._w = int(_loc3_[2]);
         _loc4_._h = int(_loc3_[3]);
         _loc4_._x = int(_loc3_[4]);
         _loc4_._y = int(_loc3_[5]);
         _loc4_._hasMusic = _loc3_[7] == "1";
         _loc4_._tag = String(_loc3_[8]);
         var _loc5_:Array = String(_loc3_[6]) == "" ? [] : String(_loc3_[6]).split(",");
         var _loc6_:int = 0;
         for each(var _loc7_:String in _loc5_)
         {
            _loc6_ += Math.max(1,int(_loc7_));
            _loc4_._ends.push(_loc6_);
         }
         _loc4_._loopMs = Math.max(1,_loc6_);
         if(_loc4_._frames < 2 || _loc4_._cols < 1 || _loc4_._w < 1 || _loc4_._h < 1 || _loc4_._ends.length != _loc4_._frames)
         {
            _loc4_._frames = 0;
         }
         return _loc4_._frames >= 2 || _loc4_._hasMusic ? _loc4_ : null;
      }

      public static function modeOf(param1:int) : int
      {
         var _loc2_:int = param1 & MODE_MASK;
         return _loc2_ > OFF ? ON_CLICK : _loc2_;
      }

      public static function mutedOf(param1:int) : Boolean
      {
         return (param1 & MUTE_BIT) != 0;
      }

      // a version with this mode and music setting (the version's other bits kept)
      public static function versionWith(param1:int, param2:int, param3:Boolean) : int
      {
         return param1 & ~(MODE_MASK | MUTE_BIT) | param2 & MODE_MASK | (param3 ? MUTE_BIT : 0);
      }

      public function get animates() : Boolean
      {
         return _frames >= 2;
      }

      public function get hasMusic() : Boolean
      {
         return _hasMusic;
      }

      public function get playing() : Boolean
      {
         return _wanted;
      }

      // where it is drawn: the item's sprite, and its still picture in it
      public function attach(param1:Sprite, param2:DisplayObject) : void
      {
         _host = param1;
         _still = param2;
      }

      // a mouse event on the item in a den (loader.DenItemHelper): true when
      // it was used, so it goes no further (a click that plays it does not
      // also walk there)
      public function mouse(param1:MouseEvent, param2:int) : Boolean
      {
         var _loc3_:int = modeOf(param2);
         if(_loc3_ == OFF)
         {
            stop();
            return false;
         }
         if(_loc3_ == ON_CLICK)
         {
            if(param1.type != "mouseDown")
            {
               return false;
            }
            if(_wanted)
            {
               stop();
            }
            else
            {
               start(param2);
            }
            return true;
         }
         if(param1.type == "mouseOver")
         {
            start(param2);
         }
         else if(param1.type == "mouseOut")
         {
            // still on the item (from its picture onto its frames, or the other way)
            if(param1.relatedObject != null && _host != null && (param1.relatedObject == _host || _host.contains(param1.relatedObject)))
            {
               return false;
            }
            stop();
         }
         return false;
      }

      // its owner changed how it plays (gui.DenLayersPanel, "dvc")
      public function settingsChanged(param1:int) : void
      {
         if(!_wanted)
         {
            return;
         }
         if(modeOf(param1) == OFF)
         {
            stop();
            return;
         }
         if(mutedOf(param1))
         {
            stopMusic();
         }
         else if(_musicOwner != this)
         {
            playMusic();
         }
      }

      public function start(param1:int) : void
      {
         if(_wanted || _host == null)
         {
            return;
         }
         _wanted = true;
         if(_hasMusic && !mutedOf(param1))
         {
            playMusic();
         }
         if(_frames < 2)
         {
            return;
         }
         var _loc2_:BitmapData = _sheets[sheetUrl()];
         if(_loc2_ != null)
         {
            show(_loc2_);
         }
         else
         {
            fetchSheet();
         }
      }

      public function stop() : void
      {
         _wanted = false;
         if(_shown)
         {
            _shown = false;
            if(_host != null)
            {
               _host.removeEventListener("enterFrame",onFrame);
            }
            if(_bmp != null && _bmp.parent != null)
            {
               _bmp.parent.removeChild(_bmp);
            }
            if(_still != null)
            {
               _still.alpha = 1;
            }
         }
         if(_musicOwner == this)
         {
            stopMusic();
         }
      }

      public function destroy() : void
      {
         stop();
         _host = null;
         _still = null;
         _bmp = null;
      }

      private function sheetUrl() : String
      {
         return gMainFrame.clientInfo.websiteURL + "itemanim/den/" + _defId + ".png?v=" + encodeURIComponent(_tag);
      }

      private function soundUrl() : String
      {
         return gMainFrame.clientInfo.websiteURL + "itemsound/den/" + _defId + ".mp3?v=" + encodeURIComponent(_tag);
      }

      // the frames' picture, fetched once for every item waiting for it
      private function fetchSheet() : void
      {
         var url:String = sheetUrl();
         var loader:Loader = null;
         var finish:Function = null;
         if(_sheetWaiting[url] != null)
         {
            (_sheetWaiting[url] as Array).push(this);
            return;
         }
         _sheetWaiting[url] = [this];
         loader = new Loader();
         finish = function(param1:Event):void
         {
            var _loc2_:BitmapData = null;
            var _loc3_:Bitmap = null;
            loader.contentLoaderInfo.removeEventListener("complete",finish);
            loader.contentLoaderInfo.removeEventListener("ioError",finish);
            loader.contentLoaderInfo.removeEventListener("securityError",finish);
            if(param1.type == "complete")
            {
               try
               {
                  _loc3_ = loader.content as Bitmap;
                  _loc2_ = _loc3_ != null ? _loc3_.bitmapData : null;
               }
               catch(e:Error)
               {
                  _loc2_ = null;
               }
            }
            var _loc4_:Array = _sheetWaiting[url] as Array;
            delete _sheetWaiting[url];
            if(_loc2_ != null)
            {
               if(_sheetCount >= SHEETS_MAX)
               {
                  _sheets = {};
                  _sheetCount = 0;
               }
               _sheets[url] = _loc2_;
               _sheetCount++;
            }
            for each(var _loc5_:ContentAnim in _loc4_)
            {
               if(_loc2_ != null && _loc5_._wanted)
               {
                  _loc5_.show(_loc2_);
               }
            }
         };
         loader.contentLoaderInfo.addEventListener("complete",finish);
         loader.contentLoaderInfo.addEventListener("ioError",finish);
         loader.contentLoaderInfo.addEventListener("securityError",finish);
         try
         {
            loader.load(new URLRequest(url),new LoaderContext(true));
         }
         catch(e:Error)
         {
            finish(new Event("ioError"));
         }
      }

      // the frames over the still picture (kept underneath, see-through, so
      // the mouse still finds the item)
      private function show(param1:BitmapData) : void
      {
         if(_shown || _host == null || _still == null)
         {
            return;
         }
         if(_bmp == null || _bmp.bitmapData != param1)
         {
            _bmp = new Bitmap(param1,"auto",true);
         }
         _bmp.x = _still.x + _x;
         _bmp.y = _still.y + _y;
         _host.addChildAt(_bmp,Math.min(_host.numChildren,_host.getChildIndex(_still) + 1));
         _still.alpha = 0;
         _shown = true;
         _frame = -1;
         _start = getTimer();
         showFrame(0);
         _host.addEventListener("enterFrame",onFrame,false,0,true);
      }

      private function onFrame(param1:Event) : void
      {
         var _loc2_:int = (getTimer() - _start) % _loopMs;
         var _loc3_:int = 0;
         while(_loc3_ < _frames - 1 && _ends[_loc3_] <= _loc2_)
         {
            _loc3_++;
         }
         showFrame(_loc3_);
      }

      private function showFrame(param1:int) : void
      {
         if(param1 == _frame || _bmp == null)
         {
            return;
         }
         _frame = param1;
         _bmp.scrollRect = new Rectangle(param1 % _cols * _w,int(param1 / _cols) * _h,_w,_h);
      }

      private function playMusic() : void
      {
         if(_musicOwner != null)
         {
            _musicOwner.stopMusic();
         }
         // it is music: the game's music switch and volume go for it too
         if(SBAudio.isMusicMuted)
         {
            return;
         }
         var _loc1_:String = soundUrl();
         var _loc2_:Sound = _sounds[_loc1_] as Sound;
         if(_loc2_ == null)
         {
            _loc2_ = new Sound();
            _loc2_.addEventListener("ioError",function(param1:Event):void
            {
            });
            try
            {
               _loc2_.load(new URLRequest(_loc1_));
            }
            catch(e:Error)
            {
               return;
            }
            _sounds[_loc1_] = _loc2_;
         }
         try
         {
            _musicChannel = _loc2_.play(0,int.MAX_VALUE,new SoundTransform(SBAudio.currentVolume));
            _musicOwner = this;
         }
         catch(e:Error)
         {
            _musicChannel = null;
         }
      }

      private function stopMusic() : void
      {
         if(_musicOwner == this)
         {
            if(_musicChannel != null)
            {
               _musicChannel.stop();
            }
            _musicChannel = null;
            _musicOwner = null;
         }
      }
   }
}
