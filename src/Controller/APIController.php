<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use App\Services\ImageManager;
use Symfony\Component\HttpFoundation\Request;

class APIController extends AbstractController
{
    public function getImageById(int $id, ImageManager $imageManager): Response
    {
        $response = $imageManager->getImageById($id);
        return $this->json([
            'status' => $response['status'],
            'message' => $response['data']
        ]); 
    }

    public function getAllImages(ImageManager $imageManager): Response
    {
        $response = $imageManager->getAllImages();
        return $this->json([
            'status' => $response['status'],
            'message' => $response['data']
        ]);
    }

    public function uploadFile(Request $request, ImageManager $imageManager): Response
    {
        $response = $imageManager->uploadFile($request);
        return $this->json([
            'status' => $response['status'],
            'message' => $response['data']
        ]);
    }

    public function uploadImageFromUrls(Request $request, ImageManager $imageManager)
    {
        $receive_data = $request->getContent();
        $receive_data = json_decode($receive_data);
        $response = $imageManager->uploadImageFromUrls($receive_data);
        return $this->json([
            'status' => $response
        ]);
    }

    public function uploadImageFromUrl(Request $request, ImageManager $imageManager): Response
    {
        $receive_data = $request->getContent();
        $receive_data = json_decode($receive_data);
        if(empty($receive_data->width)){$receive_data->width = null;}
        if(empty($receive_data->height)){$receive_data->height = null;}
        $response = $imageManager->uploadImageFromUrl($receive_data->url);
        return $this->json([
            'status' => $response['status'],
            'message' => $response['data']
        ]);
    }

    public function deleteImage(int $id, ImageManager $imageManager):Response
    {
        $response = $imageManager->deleteImage($id);
        return $this->json([
            'status' => $response['status'],
            'message' => $response['data']
        ]);
    }
}
