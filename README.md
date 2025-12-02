# 📘 Gerador de Relatórios – Leis de Newton (FastAPI + OpenAI + PDF)

Este projeto é uma API construída com **FastAPI**, integrada ao modelo de IA da OpenAI e ao ReportLab
para gerar **relatórios técnicos em PDF** totalmente automáticos sobre temas relacionados às **Leis de Newton**.

A API possui rotas independentes para gerar:
- Visão Geral  
- Materiais  
- Montagem  
- Procedimento  
- Relatório final em PDF

O sistema também verifica **consistência temática** entre todas as partes antes de gerar o relatório final.
Se o usuário solicitar temas diferentes (ex: visão sobre “Primeira Lei de Newton” e materiais sobre “fotossíntese”),
a API impede a geração do PDF e informa o erro.

---

## 🚀 Funcionalidades

### ✔️ Geração de textos pelo GPT  
Os textos seguem padrões:
- Escrita formal  
- Bem estruturada  
- Com qualidade de livro didático  
- **Com referências bibliográficas confiáveis** (ex: Halliday, Tipler, Hewitt etc.)  
- Sem markdown  
- Com coerência entre as seções

### ✔️ Consistência temática  
Antes de gerar o PDF, o sistema verifica:
- Se todas as partes possuem o **mesmo tema base**  
- Se o conteúdo está alinhado  
- Caso haja erro, o PDF não é gerado e a API retorna a mensagem:  
  **“As partes do relatório não correspondem ao mesmo tema. Gere novamente as seções antes de pedir o relatório.”**

### ✔️ PDF elegante e formatado  
O PDF utiliza:
- Cabeçalhos grandes  
- Subtítulos coloridos  
- Espaçamentos ajustados  
- Texto revisado e organizado  
- Margens padrão A4  
- Fontes profissionais do ReportLab  

---

## 📌 Rotas da API

### `POST /visao`
Gera introdução, propósito e impacto do tema solicitado.

### `POST /materiais`
Lista materiais com quantidades e descrição.

### `POST /montagem`
Descreve todos os passos da montagem.

### `POST /procedimento`
Explica o procedimento técnico e científico completo.

### `POST /relatorio`
Gera o PDF final contendo todas as partes.

Se houver divergência de temas entre as partes cadastradas:
- O sistema **bloqueia** o PDF  
- Envia uma mensagem instruindo o usuário a refazer os passos  

---

## 📦 Instalação

### 1. Criar ambiente virtual
```sh
python -m venv venv
source venv/bin/activate  # Linux
venv\Scripts\activate     # Windows
