#!/usr/bin/env bash


while [[ $# > 1 ]]
do
key="$1"

case $key in
    -t|--tmp)
    TMP="$2"
    shift
    ;;
    -i|--input)
    IN="$2"
    shift
    ;;
    -o|--output)
    OUT="$2"
    shift
    ;;
    -d|--dest)
    DEST="$2"
    shift
    ;;
    *)
    ;;
esac
shift
done

error_trap() {
    #rm -rf "$TMP"
    echo "Error on line $1"
    exit 100
}

trap 'error_trap $LINENO' ERR

#TODO: ?pipes

ffmpeg -i "$IN" -ss 00:00:5.0 -r 8 -vframes 32 -vbsf remove_extra -an -vcodec pam -f rawvideo -y "$TMP"/"$OUT".pam
convert "$TMP"/"$OUT".pam -depth 32 -colorspace YCC -resize 320x240! -colorspace Lab -identify "$TMP"/"$OUT".miff
convert "$TMP"/"$OUT".miff -ordered-dither o8x8,15,11,11 -depth 8 -colorspace sRGB -append -format %k info:
convert "$TMP"/"$OUT".miff -ordered-dither o8x8,25,12,12 -depth 8 -colorspace sRGB +dither +remap -coalesce -deconstruct -layers RemoveDups -layers Optimize -delay 1x9 -identify "$TMP"/"$OUT".gif
convert "$TMP"/"$OUT".gif -coalesce -reverse -quiet -layers OptimizePlus  -loop 0 "$TMP"/"$OUT"_r.gif


mkdir -p "$DEST"
mv "$TMP"/"$OUT"_r.gif "$DEST"/"$OUT".gif
rm -rf "$TMP"
