import os
import base64

def main():
    artifact_dir = r'C:\Users\eduaz\.gemini\antigravity\brain\da67f3ef-a0cb-49a8-a698-b643ff1234e4'

    def get_b64(filename):
        with open(os.path.join(artifact_dir, filename), 'rb') as f:
            return base64.b64encode(f.read()).decode('utf-8')

    b64_1 = get_b64('version_1.png')
    b64_2 = get_b64('version_2.png')
    b64_3 = get_b64('version_3.png')
    b64_4 = get_b64('version_4.png')

    html_content = f'''<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://www.gstatic.com/antigravity/web/dev/tailwindcss.min.js"></script>
  <style>
    .option-card {{
      transition: all 0.2s ease-in-out;
    }}
    .option-card:hover {{
      transform: translateY(-3px);
    }}
  </style>
</head>
<body class="bg-transparent text-[var(--foreground)] antialiased p-3 sm:p-5 font-sans">
  <div class="max-w-4xl mx-auto space-y-4">
    <!-- Header -->
    <div class="text-center sm:text-left">
      <h2 class="text-lg font-bold text-[var(--foreground)] tracking-tight flex items-center gap-2 justify-center sm:justify-start">
        <span>🎨</span> Escolha a Versão do Fundo do Logo
      </h2>
      <p class="text-xs text-[var(--muted-foreground)] mt-0.5">
        Todas as 4 versões utilizam a ilustração estática enviada, adaptada para ícone de aplicativo (PWA/Android/iOS/Favicon).
      </p>
    </div>

    <!-- 4 Version Grid -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      
      <!-- Option 1 -->
      <div class="option-card bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 flex flex-col items-center text-center shadow-sm hover:border-[var(--primary)] hover:shadow-md cursor-pointer">
        <div class="w-24 h-24 sm:w-28 sm:h-28 mb-2.5 rounded-xl p-1 bg-black/20 flex items-center justify-center shadow-inner">
          <img src="data:image/png;base64,{b64_1}" alt="Opção 1 - Dark Obsidian" class="w-full h-full object-contain rounded-xl drop-shadow-md" />
        </div>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-200 mb-1 border border-slate-700">
          Opção 1
        </span>
        <h3 class="font-bold text-xs text-[var(--foreground)]">Dark Obsidian</h3>
        <p class="text-[11px] text-[var(--muted-foreground)] mt-1 leading-snug">
          Fundo grafite/ardósia escuro com anel suave de profundidade.
        </p>
      </div>

      <!-- Option 2 -->
      <div class="option-card bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 flex flex-col items-center text-center shadow-sm hover:border-[var(--primary)] hover:shadow-md cursor-pointer">
        <div class="w-24 h-24 sm:w-28 sm:h-28 mb-2.5 rounded-xl p-1 bg-black/20 flex items-center justify-center shadow-inner">
          <img src="data:image/png;base64,{b64_2}" alt="Opção 2 - Deep Violet Glow" class="w-full h-full object-contain rounded-xl drop-shadow-md" />
        </div>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-950 text-purple-200 mb-1 border border-purple-800">
          Opção 2
        </span>
        <h3 class="font-bold text-xs text-[var(--foreground)]">Deep Violet Glow</h3>
        <p class="text-[11px] text-[var(--muted-foreground)] mt-1 leading-snug">
          Gradiente noturno roxo/índigo com aura sutil de alívio neurológico.
        </p>
      </div>

      <!-- Option 3 -->
      <div class="option-card bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 flex flex-col items-center text-center shadow-sm hover:border-[var(--primary)] hover:shadow-md cursor-pointer">
        <div class="w-24 h-24 sm:w-28 sm:h-28 mb-2.5 rounded-xl p-1 bg-black/20 flex items-center justify-center shadow-inner">
          <img src="data:image/png;base64,{b64_3}" alt="Opção 3 - Clean Apple White" class="w-full h-full object-contain rounded-xl drop-shadow-md" />
        </div>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-200 mb-1 border border-amber-800">
          Opção 3
        </span>
        <h3 class="font-bold text-xs text-[var(--foreground)]">Clean Light</h3>
        <p class="text-[11px] text-[var(--muted-foreground)] mt-1 leading-snug">
          Fundo claro branco/gelo clássico iOS com destaque total da face.
        </p>
      </div>

      <!-- Option 4 -->
      <div class="option-card bg-[var(--card)] border border-[var(--border)] rounded-xl p-3 flex flex-col items-center text-center shadow-sm hover:border-[var(--primary)] hover:shadow-md cursor-pointer">
        <div class="w-24 h-24 sm:w-28 sm:h-28 mb-2.5 rounded-xl p-1 bg-black/20 flex items-center justify-center shadow-inner">
          <img src="data:image/png;base64,{b64_4}" alt="Opção 4 - Midnight & Amber Glow" class="w-full h-full object-contain rounded-xl drop-shadow-md" />
        </div>
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-200 mb-1 border border-blue-800">
          Opção 4
        </span>
        <h3 class="font-bold text-xs text-[var(--foreground)]">Midnight Amber</h3>
        <p class="text-[11px] text-[var(--muted-foreground)] mt-1 leading-snug">
          Azul meia-noite com brilho radial âmbar acolhedor.
        </p>
      </div>

    </div>

    <!-- Quick instructions footer -->
    <div class="p-3 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] text-center sm:text-left">
      💡 <strong>Qual versão você prefere?</strong> Diga <strong>1, 2, 3 ou 4</strong> e aplicarei automaticamente em todos os tamanhos de ícones do PWA, favicon e cabeçalho.
    </div>
  </div>
</body>
</html>'''

    output_html = os.path.join(artifact_dir, 'logo_options.html')
    with open(output_html, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f'Successfully generated {output_html}')

if __name__ == '__main__':
    main()
