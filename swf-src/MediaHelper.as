package loader
{
   import com.sbi.loader.FileServerEvent;
   import com.sbi.loader.LoaderCache;
   import com.sbi.loader.SwfImports;
   import flash.display.Loader;
   import flash.display.LoaderInfo;
   import flash.display.MovieClip;
   import flash.events.Event;
   import flash.events.ProgressEvent;
   import flash.net.URLLoader;
   import flash.net.URLRequest;
   import flash.system.LoaderContext;
   import flash.utils.ByteArray;
   import flash.utils.setTimeout;
   import localization.LocalizationManager;
   
   public class MediaHelper
   {
      
      // a report to the server at each step of every media load: it was for
      // finding a Wine decoding fault, and at 300 players it was most of the
      // web traffic. failures are still reported.
      private static const TRACE_LOADS:Boolean = false;
      
      private var _id:uint;
      
      private var _callback:Function;
      
      private var _passback:Object;
      
      private var _loader:Loader;
      
      private var _mediaBytes:ByteArray;
      
      private var _decodeAttempts:int;
      
      private var _loadProgressFunc:Function;
      
      private var _mc:MovieClip;
      
      public function MediaHelper()
      {
         super();
      }
      
      public function init(param1:uint, param2:Function = null, param3:Object = null, param4:Function = null) : void
      {
         if(param1 == 0)
         {
            return;
         }
         _id = param1;
         _callback = param2;
         _passback = param3;
         _loadProgressFunc = param4;
         _loader = new Loader();
         MediaFileServer.instance.addEventListener("OnNewData",handleMediaData);
         MediaFileServer.instance.addEventListener("progress",onLoadProgress);
         if(TRACE_LOADS) GlobalErrorCatch.reportToServer("media " + _id + " requested");
         MediaFileServer.instance.requestFile(_id);
      }
      
      public function destroy() : void
      {
         MediaFileServer.instance.removeEventListener("OnNewData",handleMediaData);
         _mc = null;
         _passback = null;
         _loader = null;
         _callback = null;
         _loadProgressFunc = null;
      }
      
      public function get id() : int
      {
         if(_loader == null)
         {
            throw new Error("attempt to get id of an uninitialized MediaHelper instance!");
         }
         return _id;
      }
      
      private function handleMediaData(param1:FileServerEvent) : void
      {
         var _loc2_:LoaderContext = null;
         if(param1.id != _id)
         {
            return;
         }
         if(TRACE_LOADS) GlobalErrorCatch.reportToServer("media " + _id + " data success=" + param1.success + " length=" + (param1.data ? param1.data.length : -1));
         if(param1.success)
         {
            MediaFileServer.instance.removeEventListener("OnNewData",handleMediaData);
            _mediaBytes = param1.data;
            _loader.contentLoaderInfo.addEventListener("ioError",onBytesFailed);
            _loader.contentLoaderInfo.addEventListener("complete",onBytesLoaded);
            _loader.contentLoaderInfo.addEventListener("progress",onLoadProgress);
            _loc2_ = new LoaderContext();
            _loc2_.allowCodeImport = true;
            _loader.loadBytes(SwfImports.strip(param1.data),_loc2_);
         }
      }
      
      private function onLoadProgress(param1:ProgressEvent) : void
      {
         if(_loadProgressFunc != null)
         {
            _loadProgressFunc(param1);
         }
      }
      
      private function onBytesFailed(param1:Event) : void
      {
         var _loc2_:String = "";
         var _loc3_:uint = 0;
         var _loc4_:int = 0;
         _decodeAttempts = _decodeAttempts + 1;
         if(_mediaBytes != null)
         {
            while(_loc4_ < _mediaBytes.length)
            {
               _loc3_ = uint(_loc3_ + _mediaBytes[_loc4_]);
               if(_loc4_ < 8)
               {
                  _loc2_ += (_mediaBytes[_loc4_] < 16 ? "0" : "") + _mediaBytes[_loc4_].toString(16);
               }
               _loc4_++;
            }
         }
         GlobalErrorCatch.reportToServer("media " + _id + " could not be decoded (attempt " + _decodeAttempts + ", head " + _loc2_ + ", sum " + _loc3_ + "): " + param1);
         if(_decodeAttempts < 5 && _loader != null)
         {
            setTimeout(refetch,_decodeAttempts == 1 ? 100 : 1500);
         }
      }
      
      private function refetch() : void
      {
         var _loc1_:URLRequest = null;
         var _loc2_:URLLoader = null;
         if(_loader == null)
         {
            return;
         }
         MediaFileServer.instance.clearFromCache("media/",_id);
         _loc1_ = LoaderCache.fetchCDNURLRequest("media/" + _id,"/",true);
         _loc1_.url += (_loc1_.url.indexOf("?") >= 0 ? "&" : "?") + "retry=" + _decodeAttempts + "_" + new Date().time;
         _loc2_ = new URLLoader();
         _loc2_.dataFormat = "binary";
         _loc2_.addEventListener("complete",onRefetched);
         _loc2_.addEventListener("ioError",onBytesFailed);
         _loc2_.addEventListener("securityError",onBytesFailed);
         _loc2_.load(_loc1_);
      }
      
      private function onRefetched(param1:Event) : void
      {
         var _loc2_:LoaderContext = null;
         if(_loader == null)
         {
            return;
         }
         _mediaBytes = URLLoader(param1.target).data as ByteArray;
         try
         {
            _mediaBytes.uncompress();
         }
         catch(err:Error)
         {
         }
         _mediaBytes.position = 0;
         _loader.contentLoaderInfo.removeEventListener("complete",onBytesLoaded);
         _loader.contentLoaderInfo.removeEventListener("progress",onLoadProgress);
         _loader.contentLoaderInfo.removeEventListener("ioError",onBytesFailed);
         _loader = new Loader();
         _loader.contentLoaderInfo.addEventListener("complete",onBytesLoaded);
         _loader.contentLoaderInfo.addEventListener("progress",onLoadProgress);
         _loader.contentLoaderInfo.addEventListener("ioError",onBytesFailed);
         _loc2_ = new LoaderContext();
         _loc2_.allowCodeImport = true;
         _loader.loadBytes(SwfImports.strip(_mediaBytes),_loc2_);
      }
      
      private function onBytesLoaded(param1:Event) : void
      {
         var _loc2_:LoaderInfo = param1.target as LoaderInfo;
         _mc = MovieClip(_loc2_.content);
         LocalizationManager.findAllTextfields(_mc);
         if(_passback != null)
         {
            _mc.mediaHelper = this;
            _mc.passback = _passback;
         }
         param1.target.removeEventListener("complete",onBytesLoaded);
         param1.target.removeEventListener("OnLoadProgress",onLoadProgress);
         _loadProgressFunc = null;
         if(TRACE_LOADS) GlobalErrorCatch.reportToServer("media " + _id + " decoded, waitingForSharedLibrary=" + Boolean(_mc.hasOwnProperty("__rslPreloader") && _mc.__rslPreloader));
         if(_mc.hasOwnProperty("__rslPreloader") && _mc.__rslPreloader)
         {
            _mc.addEventListener("enterFrame",onFrame);
         }
         else if(_callback != null)
         {
            _callback(_mc);
            _callback = null;
         }
      }
      
      private function onFrame(param1:Event) : void
      {
         if(_mc.__rslPreloader == null)
         {
            if(TRACE_LOADS) GlobalErrorCatch.reportToServer("media " + _id + " shared library ready");
            _mc.removeEventListener("enterFrame",onFrame);
            if(_callback != null)
            {
               _callback(_mc);
               _callback = null;
            }
         }
      }
   }
}

