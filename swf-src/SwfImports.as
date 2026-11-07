package com.sbi.loader
{
   import flash.utils.ByteArray;

   // Burrow: in a browser (Ruffle, /account/play), a SWF given to
   // Loader.loadBytes that has an ImportAssets tag never finishes loading: no
   // "init", no "complete", and whatever waits for it (the world map's scene)
   // waits for good. the game's art imports "../sharedFonts.swf" with no names
   // at all, which does nothing (the game loads that file itself), so in a
   // browser those empty imports are taken out of the bytes before they are
   // loaded. the desktop client (Flash) never comes here: only the browser's
   // start values carry browserPlay=1 (lib/manage.js).
   public class SwfImports
   {

      // once true, true for good. not true yet is asked again each time: the
      // loading screen comes before the start values do.
      private static var _active:Boolean = false;

      public function SwfImports()
      {
         super();
      }

      // the movie's own parameters (in a browser the page gives it the start
      // values as those too), for what loads before gMainFrame has them: the
      // loading screen (loadProgress.LoadProgress)
      public static function noteParameters(param1:Object) : void
      {
         if(param1 && String(param1["browserPlay"]) == "1")
         {
            _active = true;
         }
      }

      public static function get active() : Boolean
      {
         if(!_active)
         {
            try
            {
               _active = gMainFrame && gMainFrame.clientInfo && String(gMainFrame.clientInfo["browserPlay"]) == "1";
            }
            catch(e:Error)
            {
            }
         }
         return _active;
      }

      // the bytes to load: `swf` itself, or a copy without its empty imports
      // (uncompressed, from FWS, CWS or ZWS). anything it cannot read is left as it is.
      public static function strip(swf:ByteArray) : ByteArray
      {
         if(!active || swf == null || swf.length < 8)
         {
            return swf;
         }
         try
         {
            return stripped(swf);
         }
         catch(e:Error)
         {
         }
         return swf;
      }

      private static function stripped(swf:ByteArray) : ByteArray
      {
         var sig:String = String.fromCharCode(swf[0],swf[1],swf[2]);
         var body:ByteArray = new ByteArray();
         if(sig == "FWS" || sig == "CWS")
         {
            body.writeBytes(swf,8);
            if(sig == "CWS")
            {
               body.uncompress();
            }
         }
         else if(sig == "ZWS" && swf.length > 17)
         {
            // LZMA: 4 bytes the whole file's length, 4 the packed length, 5
            // the LZMA properties, then the packed body. uncompress("lzma")
            // wants the properties, then the unpacked length in 8 bytes.
            var unpacked:uint = uint(swf[4] | swf[5] << 8 | swf[6] << 16 | swf[7] << 24) - 8;
            body.endian = "littleEndian";
            body.writeBytes(swf,12,5);
            body.writeUnsignedInt(unpacked);
            body.writeUnsignedInt(0);
            body.writeBytes(swf,17);
            body.uncompress("lzma");
         }
         else
         {
            return swf;
         }
         body.endian = "littleEndian";
         var bits:int = body[0] >> 3;
         var at:int = Math.ceil((5 + bits * 4) / 8) + 4;
         var out:ByteArray = new ByteArray();
         out.endian = "littleEndian";
         out.writeBytes(body,0,at);
         var found:Boolean = false;
         var code:int = 0;
         var length:int = 0;
         var head:int = 0;
         var tag:int = 0;
         while(at + 2 <= body.length)
         {
            body.position = at;
            tag = int(body.readUnsignedShort());
            code = tag >> 6;
            length = tag & 0x3F;
            head = 2;
            if(length == 0x3F)
            {
               length = int(body.readUnsignedInt());
               head = 6;
            }
            if((code == 71 || code == 57) && importsNothing(body,at + head,length,code))
            {
               found = true;
            }
            else
            {
               out.writeBytes(body,at,Math.min(head + length,body.length - at));
            }
            at += head + length;
            if(code == 0)
            {
               break;
            }
         }
         if(!found)
         {
            return swf;
         }
         var result:ByteArray = new ByteArray();
         result.endian = "littleEndian";
         result.writeByte(70);
         result.writeByte(87);
         result.writeByte(83);
         result.writeByte(swf[3]);
         result.writeUnsignedInt(out.length + 8);
         result.writeBytes(out);
         result.position = 0;
         return result;
      }

      // an ImportAssets (57) or ImportAssets2 (71) tag that names nothing
      private static function importsNothing(body:ByteArray, start:int, length:int, code:int) : Boolean
      {
         var at:int = start;
         var end:int = start + length;
         while(at < end && body[at] != 0)
         {
            at++;
         }
         at++;
         if(code == 71)
         {
            at += 2;
         }
         if(at + 2 > end)
         {
            return false;
         }
         return (body[at] | body[at + 1] << 8) == 0;
      }
   }
}
