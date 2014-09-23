<?php
include ('mp3file.class.php');
/**
 * 项目函数库，系统自动加载
 */

function get_array_values($input) {
	if (empty ($input)) {
		return array ();
	} else {
		return array_values($input);
	}
}

function arr_filters(&$arr){
	array_walk_recursive($arr,"_arr_filters");
}

function _arr_filters(&$v, $k) {
	if($v === null){
		$v = '';
	}
}

function is_mongoId($mongoId){
    if(!$mongoId || !preg_match('/^[0-9a-fA-F]{24}$/',$mongoId)){
        return false;
    }
    return true;
}

function DD($c){
	$model = new UserModel($c);
	return $model;
}

function getDistance($lat1, $lng1, $lat2, $lng2) {
	$earthRadius = 6367000; //approximate radius of earth in meters 

	/* 
	  Convert these degrees to radians 
	  to work with the formula 
	*/
	$lat1 = ($lat1 * pi()) / 180;
	$lng1 = ($lng1 * pi()) / 180;

	$lat2 = ($lat2 * pi()) / 180;
	$lng2 = ($lng2 * pi()) / 180;

	/* 
	  Using the 
	  Haversine formula 
	  http://en.wikipedia.org/wiki/Haversine_formula 
	  calculate the distance 
	*/
	$calcLongitude = $lng2 - $lng1;
	$calcLatitude = $lat2 - $lat1;
	$stepOne = pow(sin($calcLatitude / 2), 2) + cos($lat1) * cos($lat2) * pow(sin($calcLongitude / 2), 2);
	$stepTwo = 2 * asin(min(1, sqrt($stepOne)));
	$calculatedDistance = $earthRadius * $stepTwo;

	return round($calculatedDistance);
}

function get_links($url='http://pan.baidu.com/share/link?shareid=368650&uk=3255686317') {
	$xml = new DOMDocument();
	$xml->loadHTMLFile($url);
	$links = array(); 
	foreach($xml->getElementsByTagName('a') as $link) { 
		$links[] = array('url' => $link->getAttribute('href'), 'text' => $link->nodeValue);
	} 
	return $links; 
}

function safefilerewrite($fileName, $dataToSave)
{    if ($fp = fopen($fileName, 'w'))
    {
        $startTime = microtime();
        do
        {            $canWrite = flock($fp, LOCK_EX);
           // If lock not obtained sleep for 0 - 100 milliseconds, to avoid collision and CPU load
           if(!$canWrite) usleep(round(rand(0, 100)*1000));
        } while ((!$canWrite)and((microtime()-$startTime) < 1000));

        //file was locked so now we can store information
        if ($canWrite)
        {            fwrite($fp, $dataToSave);
            flock($fp, LOCK_UN);
        }
        fclose($fp);
    }

}

function write_php_ini($array, $file)
{
    $res = array();
    foreach($array as $key => $val)
    {
        if(is_array($val))
        {
            $res[] = "[$key]";
            foreach($val as $skey => $sval) $res[] = "$skey = " . $sval;
        }
        else $res[] = "$key = " . $val;
    }
    safefilerewrite($file, implode("\r\n", $res));
}

function startsWith($haystack,$needle,$case=true)
{
   if($case)
       return strpos($haystack, $needle, 0) === 0;

   return stripos($haystack, $needle, 0) === 0;
}

function endsWith($haystack,$needle,$case=true)
{
  $expectedPosition = strlen($haystack) - strlen($needle);

  if($case)
      return strrpos($haystack, $needle, 0) === $expectedPosition;

  return strripos($haystack, $needle, 0) === $expectedPosition;
}

function getCallingMethodName($level = 1) {
	$callers=debug_backtrace();
	return $callers[$level]['function'];
}

if (!function_exists('array_column')) {
    function array_column($input, $column_key, $index_key = null)
    {
        if ($index_key !== null) {
            // Collect the keys
            $keys = array();
            $i = 0; // Counter for numerical keys when key does not exist
            
            foreach ($input as $row) {
                if (array_key_exists($index_key, $row)) {
                    // Update counter for numerical keys
                    if (is_numeric($row[$index_key]) || is_bool($row[$index_key])) {
                        $i = max($i, (int) $row[$index_key] + 1);
                    }
                    
                    // Get the key from a single column of the array
                    $keys[] = $row[$index_key];
                } else {
                    // The key does not exist, use numerical indexing
                    $keys[] = $i++;
                }
            }
        }
        
        if ($column_key !== null) {
            // Collect the values
            $values = array();
            $i = 0; // Counter for removing keys
            
            foreach ($input as $row) {
                if (array_key_exists($column_key, $row)) {
                    // Get the values from a single column of the input array
                    $values[] = $row[$column_key];
                    $i++;
                } elseif (isset($keys)) {
                    // Values does not exist, also drop the key for it
                    array_splice($keys, $i, 1);
                }
            }
        } else {
            // Get the full arrays
            $values = array_values($input);
        }
        
        if ($index_key !== null) {
            return array_combine($keys, $values);
        }
        
        return $values;
    }
}

function imagecreatefrombmp( $filename ){
	if ( !$f1 = fopen( $filename, "rb" ) )
		return FALSE;
	
	$FILE = unpack( "vfile_type/Vfile_size/Vreserved/Vbitmap_offset", fread( $f1, 14 ) );
	if ( $FILE['file_type'] != 19778 )
		return FALSE;
	
	$BMP = unpack( 'Vheader_size/Vwidth/Vheight/vplanes/vbits_per_pixel' . '/Vcompression/Vsize_bitmap/Vhoriz_resolution' . '/Vvert_resolution/Vcolors_used/Vcolors_important', fread( $f1, 40 ) );
	$BMP['colors'] = pow( 2, $BMP['bits_per_pixel'] );
	if ( $BMP['size_bitmap'] == 0 )
		$BMP['size_bitmap'] = $FILE['file_size'] - $FILE['bitmap_offset'];
	$BMP['bytes_per_pixel'] = $BMP['bits_per_pixel'] / 8;
	$BMP['bytes_per_pixel2'] = ceil( $BMP['bytes_per_pixel'] );
	$BMP['decal'] = ($BMP['width'] * $BMP['bytes_per_pixel'] / 4);
	$BMP['decal'] -= floor( $BMP['width'] * $BMP['bytes_per_pixel'] / 4 );
	$BMP['decal'] = 4 - (4 * $BMP['decal']);
	if ( $BMP['decal'] == 4 )
		$BMP['decal'] = 0;
	
	$PALETTE = array();
	if ( $BMP['colors'] < 16777216 ){
		$PALETTE = unpack( 'V' . $BMP['colors'], fread( $f1, $BMP['colors'] * 4 ) );
	}
	
	$IMG = fread( $f1, $BMP['size_bitmap'] );
	$VIDE = chr( 0 );
	
	$res = imagecreatetruecolor( $BMP['width'], $BMP['height'] );
	$P = 0;
	$Y = $BMP['height'] - 1;
	while( $Y >= 0 ){
		$X = 0;
		while( $X < $BMP['width'] ){
			if ( $BMP['bits_per_pixel'] == 32 ){
				$COLOR = unpack( "V", substr( $IMG, $P, 3 ) );
				$B = ord(substr($IMG, $P,1));
				$G = ord(substr($IMG, $P+1,1));
				$R = ord(substr($IMG, $P+2,1));
				$color = imagecolorexact( $res, $R, $G, $B );
				if ( $color == -1 )
					$color = imagecolorallocate( $res, $R, $G, $B );
				$COLOR[0] = $R*256*256+$G*256+$B;
				$COLOR[1] = $color;
			}elseif ( $BMP['bits_per_pixel'] == 24 )
			$COLOR = unpack( "V", substr( $IMG, $P, 3 ) . $VIDE );
			elseif ( $BMP['bits_per_pixel'] == 16 ){
				$COLOR = unpack( "n", substr( $IMG, $P, 2 ) );
				$COLOR[1] = $PALETTE[$COLOR[1] + 1];
			}elseif ( $BMP['bits_per_pixel'] == 8 ){
				$COLOR = unpack( "n", $VIDE . substr( $IMG, $P, 1 ) );
				$COLOR[1] = $PALETTE[$COLOR[1] + 1];
			}elseif ( $BMP['bits_per_pixel'] == 4 ){
				$COLOR = unpack( "n", $VIDE . substr( $IMG, floor( $P ), 1 ) );
				if ( ($P * 2) % 2 == 0 )
					$COLOR[1] = ($COLOR[1] >> 4);
				else
					$COLOR[1] = ($COLOR[1] & 0x0F);
				$COLOR[1] = $PALETTE[$COLOR[1] + 1];
			}elseif ( $BMP['bits_per_pixel'] == 1 ){
				$COLOR = unpack( "n", $VIDE . substr( $IMG, floor( $P ), 1 ) );
				if ( ($P * 8) % 8 == 0 )
					$COLOR[1] = $COLOR[1] >> 7;
				elseif ( ($P * 8) % 8 == 1 )
				$COLOR[1] = ($COLOR[1] & 0x40) >> 6;
				elseif ( ($P * 8) % 8 == 2 )
				$COLOR[1] = ($COLOR[1] & 0x20) >> 5;
				elseif ( ($P * 8) % 8 == 3 )
				$COLOR[1] = ($COLOR[1] & 0x10) >> 4;
				elseif ( ($P * 8) % 8 == 4 )
				$COLOR[1] = ($COLOR[1] & 0x8) >> 3;
				elseif ( ($P * 8) % 8 == 5 )
				$COLOR[1] = ($COLOR[1] & 0x4) >> 2;
				elseif ( ($P * 8) % 8 == 6 )
				$COLOR[1] = ($COLOR[1] & 0x2) >> 1;
				elseif ( ($P * 8) % 8 == 7 )
				$COLOR[1] = ($COLOR[1] & 0x1);
				$COLOR[1] = $PALETTE[$COLOR[1] + 1];
			}else
				return FALSE;
			imagesetpixel( $res, $X, $Y, $COLOR[1] );
			$X++;
			$P += $BMP['bytes_per_pixel'];
		}
		$Y--;
		$P += $BMP['decal'];
	}
	fclose( $f1 );
	
	return $res;
}

function make_thumb($src, $dest, $n_width) {
	$type = exif_imagetype($src);
	if ($type == IMAGETYPE_JPEG) {
		$im = ImageCreateFromJPEG($src);
	} else if ($type == IMAGETYPE_PNG) {
		$im=ImageCreateFromPNG($src); 
	} else if ($type == IMAGETYPE_BMP) {
		$im=imagecreatefrombmp($src); 
	}
	$width=ImageSx($im);
	$height=ImageSy($im);
	$n_height=round($n_width*$height/$width);
	$newimage=imagecreatetruecolor($n_width,$n_height);
	ImageCopyResampled($newimage, $im, 0, 0, 0, 0, $n_width+1, $n_height+1, $width, $height);
	ImageJPEG($newimage,$dest);
	ImageDestroy($im);
	ImageDestroy($newimage);
}

function mp3_len($file) {
	$m = new mp3file($file);
	$a = $m->get_metadata();
	return $a['Length'] ? $a['Length'] : 0;
}

function mid($array) {
	foreach ($array as $k=>&$v) {
		$v = new MongoId($v);
	}
	return $array;
}

function tail_log($length=20000) {
	$fn = $_SERVER['DOCUMENT_ROOT'] . '/App/Runtime/Logs/' . date('y_m_d') . '.log';
	$fh = fopen($fn, 'r');
	$size = filesize($fn) - $length;
	$size = $size > 0 ? $size : 0;
	fseek($fh, $size);
	while ($d = fgets($fh)) {
		$content .= fgets($fh);
	}
	fclose($fh);
	return $content;
}

function encrypt($str, $key) {
	if (!$key) {
		$key = C('DES_KEY');
	}
    $block = mcrypt_get_block_size('des', 'ecb');
    $pad = $block - (strlen($str) % $block);
    $str .= str_repeat(chr($pad), $pad);
    return base64_encode(mcrypt_encrypt(MCRYPT_DES, $key, $str, MCRYPT_MODE_ECB));
}
    
function decrypt($str, $key) {
	if (!$key) {
		$key = C('DES_KEY');
	}
    $str = mcrypt_decrypt(MCRYPT_DES, $key, $str, MCRYPT_MODE_ECB);
    $block = mcrypt_get_block_size('des', 'ecb');
    $pad = ord($str[($len = strlen($str)) - 1]);
    return substr($str, 0, strlen($str) - $pad);
}

function getParam() {
	$map = array_merge(I('post.'), I('get.'));
	$map = array_filter($map);
	unset($map['_URL_'],$map['model'],$map['page'],$map['rows']);
	$like = explode(',', $map['like']);
	foreach ( $like as $k => $v ) {
		if (strlen($v) > 0) {
			$map[$v] = array('like', $map[$v]);
		}
	}
	unset($map['like']);
	debug('param='. json_encode($map));
	return $map;
}

function debug($msg) {
	Log :: write($msg, Log :: DEBUG);
}

function err($msg) {
	Log :: write($msg, Log :: ERR);
}	