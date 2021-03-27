<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class PagesController extends AbstractController
{
    public function index(): Response
    {
        return $this->render('base.html.twig',['page_title' => 'Тестовое задания для Ecwid']);
    }
}
