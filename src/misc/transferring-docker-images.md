# Transferring Docker Images

## 1. Build an image from a Dockerfile in the current directory

```shell
docker build -t myimage:latest .
```

## 2. Save/export the image to a tar file

```shell
docker save -o myimage.tar myimage:latest
```

## 3. Transfer the file (USB stick, sneaker net, etc.)

## 4. Load/import the image back on another machine

```shell
docker load -i myimage.tar
```
