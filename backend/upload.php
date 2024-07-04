<?php
header('Content-Type: application/json'); // Asegura que la respuesta sea JSON

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_FILES['file'])) {
    $uploadDir = '../anuncio/'; // Ruta del directorio local donde quieres guardar los archivos subidos
    $uploadFile = $uploadDir . basename($_FILES['file']['name']);

    // Verifica si el directorio existe, si no, créalo
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);
    }

    if (move_uploaded_file($_FILES['file']['tmp_name'], $uploadFile)) {
        // Construye la URL relativa del archivo subido
        $relativeUrl = 'anuncios/' . basename($_FILES['file']['name']);
        echo json_encode(['status' => 'success', 'url' => $relativeUrl]);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'No se pudo subir el archivo.']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Solicitud inválida.']);
}
?>
