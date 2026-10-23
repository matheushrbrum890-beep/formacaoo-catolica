# Formação Católica — Fé, liturgia e vida

Biblioteca web estática com os textos extraídos dos seis PowerPoints e do documento Word enviados, organizados em sete temas. Inclui busca, navegação por tema, capítulos expansíveis, imagens com fonte/licença indicada e vídeos educativos incorporados do YouTube.

## Publicar no GitHub Pages

1. Extraia o ZIP.
2. Crie um repositório GitHub e coloque os arquivos desta pasta na raiz; `index.html` deve ficar na raiz.
3. Acesse **Settings → Pages**. Em **Build and deployment**, selecione **Deploy from a branch**, branch `main`, pasta `/ (root)`, e salve.
4. Abra o endereço que o GitHub exibir na área Pages.

Não carregue o ZIP como site: extraia-o primeiro. Para upload, GitHub Desktop ou Git são mais confiáveis que o upload de navegador quando há vários arquivos.

## Como as mídias são usadas

- **Fotografias/ilustrações:** cada cartão da galeria informa autoria, licença e link para a página-fonte do Wikimedia Commons. As mídias foram escolhidas em páginas que indicam domínio público, CC0 ou licença Creative Commons (como CC BY e CC BY-SA). Consulte a página-fonte e cumpra a licença original ao reutilizar fora deste site.
- **Vídeos:** reproduzidos por incorporação do player oficial do YouTube (modo de privacidade aprimorada). Eles **não foram baixados nem redistribuídos** pelo site; o canal/publicador mantém os direitos e pode desativar a incorporação ou remover o vídeo. Estar disponível no YouTube não significa que o vídeo tenha licença livre para download/reedição.
- **Textos de formação:** foram organizados a partir dos arquivos enviados, mantendo a redação extraível e a sequência original. O site não fez revisão doutrinal nem corrigiu automaticamente eventuais inconsistências.

## Temas incluídos

- Mês Mariano
- Tempo Comum
- Agosto — Mês das Vocações
- Tempo Quaresmal
- Tempo Pascal
- Semana Santa
- 1º Seminário de Inverno — Santa Missa

## Teste local

Execute na pasta do site:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`. O site precisa de conexão à internet para carregar os vídeos do YouTube e as mídias do Wikimedia Commons.
