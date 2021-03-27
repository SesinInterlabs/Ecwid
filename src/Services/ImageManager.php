<?php
namespace App\Services;

use App\Entity\Image;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Filesystem\Exception\IOExceptionInterface;
use Symfony\Component\Filesystem\Filesystem;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Contracts\HttpClient\HttpClientInterface;
use Symfony\Flex\Options;

class ImageManager
{
    public function __construct(EntityManagerInterface $entityManager,
                                Filesystem $filesystem,
                                HttpClientInterface $client
                                )
    {
        $this->em = $entityManager;
        $this->filesystem = $filesystem;
        $this->client = $client;
    }

    function getImageById($id)
    {
        $image = $this->em->getRepository(Image::class)->find($id);
        if($image)
        {
            $image_arr = [
                'url' => $image->getUrl(),
                'width' => $image->getWidth(),
                'height' => $image->getHight()
            ];
            $returnData = [
                'status' => 'ok',
                'data' => $image_arr
            ];
        }else{
            $returnData = [
                'status' => 'faild',
                'data' => 'image with id='.$id.' not found'
            ];
        }
        return $returnData;
    }

    function getAllImages()
    {
        $images = $this->em->getRepository(Image::class)->findAll();
        $images_arr = [];
        foreach($images as $image)
        {
            $image_arr = [
                'id' => $image->getId(),
                'url' => $image->getUrl(),
                'width' => $image->getWidth(),
                'height' => $image->getHight()
            ];
            array_push($images_arr, $image_arr);
        }

        $returnData = [
            'status' => 'ok',
            'data' => $images_arr
        ];
        return $returnData;
    }

    function uploadImageFromUrls($images)
    {
        $status_arr = [];
        foreach($images as $image)
        {
            $status = $this->uploadImageFromUrl($image->url);
            array_push($status_arr, $status);
        }
        return $status_arr;
    }

    function uploadFile($data)
    {
        $file = $data->files->get('file');
        $extention = $file->getClientOriginalExtension();

        if($extention == 'JSON' || $extention == 'json')
        {
            //dd(json_decode($file->getContent()));
            $images = json_decode($file->getContent());
            $uploadStatus = [];
            if(!empty($images))
            {
                foreach($images as $image)
                {
                    $status = $this->uploadImageFromUrl($image->url);
                    array_push($uploadStatus, $status);
                }
            }

            return $returnData = [
                'status' => 'ready',
                'data' => $uploadStatus
            ];
        }

        $content = $file->getContent();
        $name = md5(uniqid()).'.'.$extention;
        try {
            $this->filesystem->dumpFile('upload/images/'.$name, $content);
            $fileSize = getimagesize('upload/images/'.$name);
        }catch (IOExceptionInterface $e){
            $returnData = [
                'status' => 'error',
                'data' => $e->getMessage()
            ];
            return $returnData;
        }

        $image = new Image();
        $image->setUrl('upload/images/'.$name);
        $image->setWidth($fileSize[0]);
        $image->setHight($fileSize[1]);

        $this->em->persist($image);
        $this->em->flush();

        $returnData = [
            'status' => 'ok',
            'data' => ['id' => $image->getId(),'path' => 'upload/images/'.$name]
        ];
        return $returnData;
    }


    function uploadImageFromUrl(string $url)
    {
        $response = $this->client->request('GET', $url);
        $content = $response->getContent();
        $info = $response->getInfo();
        $name = md5(uniqid()).'.'.$this->getMime($info['response_headers']['1']);
        try {
            $this->filesystem->dumpFile('upload/images/'.$name, $content);
            $fileSize = getimagesize('upload/images/'.$name);
        }catch (IOExceptionInterface $e){
            $returnData = [
                'status' => 'error',
                'data' => $e->getMessage()
            ];
            return $returnData;
        }

        $image = new Image();
        $image->setUrl('upload/images/'.$name);
        $image->setWidth($fileSize[0]);
        $image->setHight($fileSize[1]);

        $this->em->persist($image);
        $this->em->flush();

        $returnData = [
            'status' => 'ok',
            'data' => ['id' => $image->getId(),'path' => 'upload/images/'.$name]
        ];
        return $returnData;
    }

    public function deleteImage($id)
    {
        $image = $this->em->getRepository(Image::class)->find($id);
        if($image)
        {
            $url = $image->getUrl();
            if($this->filesystem->exists($url))
            {
                $this->filesystem->remove([$url]);
            }
            $this->em->remove($image);
            $this->em->flush();

            $returnData = [
                'status' => 'ok',
                'data' => 'image with id='.$id.' is delete'
            ];
        }else{
            $returnData = [
                'status' => 'faild',
                'data' => 'image with id='.$id.' not found'
            ];
        }
        return $returnData;
    }

    private function getMime($data): String
    {
        if($data == 'Content-Type: image/jpeg')
        {
            return 'jpg';
        }

        if($data == 'Content-Type: image/png')
        {
            return 'png';
        }
    }
}