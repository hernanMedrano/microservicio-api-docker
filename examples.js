// Archivo eliminado: No se requieren ejemplos.
    if (result.success) {
      console.log('✅ Ejecutado exitosamente');
      console.log(`Duración: ${result.duration}`);
      console.log(`ID de ejecución: ${result.executionId}`);
      console.log('Información de BD:', result.dbInfo);
    } else {
      console.error('❌ Error:', result.message);
    }
    
    return result;
  } catch (error) {
    console.error('Error de conexión:', error.message);
  }
}

// ==========================================
// 2. Node.js - axios (alternativa)
// ==========================================
async function executeMaintenanceAxios() {
  const axios = require('axios');

  try {
    const response = await axios.post('http://localhost:3000/api/maintenance/execute', {
      serverIp: '192.168.1.100',
      databaseName: 'YourDatabase'
    });

    console.log('Resultado:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
  }
}

// ==========================================
// 3. Python - requests
// ==========================================
function pythonExample() {
  const code = `
import requests
import json
from datetime import datetime

def execute_maintenance(server_ip, database_name):
    url = 'http://localhost:3000/api/maintenance/execute'
    
    payload = {
        'serverIp': server_ip,
        'databaseName': database_name
    }
    
    try:
        response = requests.post(url, json=payload, timeout=1200)  # 20 minutos
        result = response.json()
        
        if result['success']:
            print(f"✅ Processo completado en {result['duration']}")
            print(f"ID de ejecución: {result['executionId']}")
            for db_info in result['dbInfo']:
                print(f"  - DbId: {db_info['DbId']}")
                print(f"  - Tamaño: {db_info['CurrentSize']} páginas")
        else:
            print(f"❌ Error: {result['message']}")
        
        return result
    except requests.exceptions.Timeout:
        print("La solicitud expiró (la BD se está manteniendo)")
    except Exception as e:
        print(f"Error de conexión: {str(e)}")

# Uso
if __name__ == "__main__":
    execute_maintenance('192.168.1.100', 'YourDatabase')
`;
  return code;
}

// ==========================================
// 4. C# - HttpClient
// ==========================================
function csharpExample() {
  const code = `
using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Threading.Tasks;
using Newtonsoft.Json;

public class MaintenanceClient
{
    private readonly string _baseUrl;
    private readonly HttpClient _httpClient;

    public MaintenanceClient(string baseUrl = "http://localhost:3000")
    {
        _baseUrl = baseUrl;
        _httpClient = new HttpClient()
        {
            Timeout = TimeSpan.FromMinutes(20) // 20 minutos
        };
    }

    public async Task<bool> ExecuteMaintenance(string serverIp, string databaseName)
    {
        try
        {
            var request = new
            {
                serverIp = serverIp,
                databaseName = databaseName
            };

            var json = JsonConvert.SerializeObject(request);
            var content = new StringContent(json, System.Text.Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync(
                \$"{_baseUrl}/api/maintenance/execute", 
                content
            );

            var responseString = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<dynamic>(responseString);

            if (result["success"])
            {
                Console.WriteLine(\$"✅ Proceso completado en {result["duration"]}\");
                Console.WriteLine(\$"ID: {result["executionId"]}\");
                return true;
            }
            else
            {
                Console.WriteLine(\$"❌ Error: {result["message"]}\");
                return false;
            }
        }
        catch (Exception ex)
        {
            Console.WriteLine(\$"Error: {ex.Message}\");
            return false;
        }
    }
}

// Uso
class Program
{
    static async Task Main(string[] args)
    {
        var client = new MaintenanceClient();
        await client.ExecuteMaintenance("192.168.1.100", "YourDatabase");
    }
}
`;
  return code;
}

// ==========================================
// 5. PowerShell
// ==========================================
function powershellExample() {
  const code = `
# Función para ejecutar mantenimiento
function Invoke-DatabaseMaintenance {
    param(
        [Parameter(Mandatory=$true)]
        [string]\$ServerIp,
        
        [Parameter(Mandatory=$true)]
        [string]\$DatabaseName,
        
        [string]\$ServiceUrl = "http://localhost:3000"
    )

    \$Uri = "\$ServiceUrl/api/maintenance/execute"
    
    \$Body = @{
        serverIp = \$ServerIp
        databaseName = \$DatabaseName
    } | ConvertTo-Json

    try {
        Write-Host "Iniciando mantenimiento de BD..." -ForegroundColor Yellow
        
        \$Response = Invoke-RestMethod -Uri \$Uri \`
            -Method POST \`
            -ContentType "application/json" \`
            -Body \$Body \`
            -TimeoutSec 1200  # 20 minutos

        if (\$Response.success) {
            Write-Host "✅ Mantenimiento completado" -ForegroundColor Green
            Write-Host "Duración: \$(\$Response.duration)"
            Write-Host "ID: \$(\$Response.executionId)"
            
            Write-Host "Información de Base de Datos:" -ForegroundColor Cyan
            \$Response.dbInfo | Format-Table -AutoSize
        } else {
            Write-Host "❌ Error: \$(\$Response.message)" -ForegroundColor Red
        }
        
        return \$Response
    }
    catch {
        Write-Host "Error de conexión: \$(\$_.Exception.Message)" -ForegroundColor Red
    }
}

# Uso
Invoke-DatabaseMaintenance -ServerIp "192.168.1.100" -DatabaseName "YourDatabase"
`;
  return code;
}

// ==========================================
// 6. CURL (Linux/Mac/Git Bash)
// ==========================================
function curlExample() {
  const code = `
#!/bin/bash

# Ejecutar mantenimiento
curl -X POST http://localhost:3000/api/maintenance/execute \
  -H "Content-Type: application/json" \
  -d '{
    "serverIp": "192.168.1.100",
    "databaseName": "YourDatabase"
  }' \
  --max-time 1200

# Obtener estado
curl http://localhost:3000/api/maintenance/status/YourDatabase

# Health check
curl http://localhost:3000/api/health

# Con jq para formatear JSON (si está instalado)
curl -s http://localhost:3000/api/health | jq .
`;
  return code;
}

// ==========================================
// 7. PHP - cURL
// ==========================================
function phpExample() {
  const code = `
<?php

function executeMaintenance(\$serverIp, \$databaseName)
{
    \$url = 'http://localhost:3000/api/maintenance/execute';
    
    \$data = json_encode([
        'serverIp' => \$serverIp,
        'databaseName' => \$databaseName
    ]);
    
    \$ch = curl_init();
    
    curl_setopt_array(\$ch, [
        CURLOPT_URL => \$url,
        CURLOPT_CUSTOMREQUEST => 'POST',
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Content-Length: ' . strlen(\$data)
        ],
        CURLOPT_POSTFIELDS => \$data,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 1200  // 20 minutos
    ]);
    
    \$response = curl_exec(\$ch);
    \$httpCode = curl_getinfo(\$ch, CURLINFO_HTTP_CODE);
    curl_close(\$ch);
    
    \$result = json_decode(\$response, true);
    
    if (\$result['success']) {
        echo "✅ Proceso completado en " . \$result['duration'] . "\\n";
        echo "ID: " . \$result['executionId'] . "\\n";
        
        echo "Información de BD:\\n";
        foreach (\$result['dbInfo'] as \$info) {
            echo "  - DbId: " . \$info['DbId'] . "\\n";
            echo "  - Tamaño: " . \$info['CurrentSize'] . " páginas\\n";
        }
    } else {
        echo "❌ Error: " . \$result['message'] . "\\n";
    }
    
    return \$result;
}

// Uso
executeMaintenance('192.168.1.100', 'YourDatabase');
?>
`;
  return code;
}

// ==========================================
// 8. Java - HttpClient
// ==========================================
function javaExample() {
  const code = `
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

public class MaintenanceClient {
    public static void executeMaintenance(String serverIp, String databaseName) {
        HttpClient client = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(30))
            .build();

        JsonObject payload = new JsonObject();
        payload.addProperty("serverIp", serverIp);
        payload.addProperty("databaseName", databaseName);

        HttpRequest request = HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:3000/api/maintenance/execute"))
            .POST(HttpRequest.BodyPublishers.ofString(payload.toString()))
            .header("Content-Type", "application/json")
            .timeout(Duration.ofMinutes(20))
            .build();

        try {
            HttpResponse<String> response = client.send(request,
                HttpResponse.BodyHandlers.ofString());

            Gson gson = new Gson();
            JsonObject result = gson.fromJson(response.body(), JsonObject.class);

            if (result.get("success").getAsBoolean()) {
                System.out.println("✅ Proceso completado en " + 
                    result.get("duration").getAsString());
                System.out.println("ID: " + result.get("executionId").getAsString());
            } else {
                System.out.println("❌ Error: " + result.get("message").getAsString());
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public static void main(String[] args) {
        executeMaintenance("192.168.1.100", "YourDatabase");
    }
}
`;
  return code;
}

// ==========================================
// 9. Go - http
// ==========================================
function goExample() {
  const code = `
package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"net/http"
	"time"
)

type MaintenanceRequest struct {
	ServerIp     string \`json:"serverIp"\`
	DatabaseName string \`json:"databaseName"\`
}

type MaintenanceResponse struct {
	Success       bool   \`json:"success"\`
	ExecutionId   string \`json:"executionId"\`
	Duration      string \`json:"duration"\`
	Message       string \`json:"message"\`
}

func executeMaintenance(serverIp, databaseName string) {
	req := MaintenanceRequest{
		ServerIp:     serverIp,
		DatabaseName: databaseName,
	}

	jsonData, _ := json.Marshal(req)

	client := &http.Client{
		Timeout: time.Minute * 20,
	}

	request, _ := http.NewRequest("POST", 
		"http://localhost:3000/api/maintenance/execute",
		bytes.NewBuffer(jsonData))
	
	request.Header.Set("Content-Type", "application/json")

	response, err := client.Do(request)
	if err != nil {
		fmt.Println("Error:", err)
		return
	}
	defer response.Body.Close()

	body, _ := ioutil.ReadAll(response.Body)

	var result MaintenanceResponse
	json.Unmarshal(body, &result)

	if result.Success {
		fmt.Printf("✅ Proceso completado en %s\\n", result.Duration)
		fmt.Printf("ID: %s\\n", result.ExecutionId)
	} else {
		fmt.Printf("❌ Error: %s\\n", result.Message)
	}
}

func main() {
	executeMaintenance("192.168.1.100", "YourDatabase")
}
`;
  return code;
}

// ==========================================
// Exportar ejemplos
// ==========================================
module.exports = {
  pythonExample,
  csharpExample,
  powershellExample,
  curlExample,
  phpExample,
  javaExample,
  goExample,
  executeMaintenanceJS,
  executeMaintenanceAxios
};
