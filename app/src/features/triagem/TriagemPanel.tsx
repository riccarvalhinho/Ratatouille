/**
 * O painel "Apetece-me algo". Ver `docs/product/roadmap.md` (N0) e a conversa 2.
 *
 * Um assistente de filtro, não um questionário: dois níveis de mosaicos onde se toca no critério, ele
 * abre as opções em ícones, e volta-se. **Nada é obrigatório** — um toque num critério, uma opção, e
 * pode ir-se embora sem passar pelos outros sete.
 *
 * Não substitui os filtros à mão e não é o ponto de entrada da app: a lista completa continua a ser o
 * ecrã principal e isto é uma porta lateral. E escreve **nos mesmos filtros** que o catálogo já usa —
 * duas entradas para o mesmo estado não fazem mal nenhum, dois estados fariam.
 *
 * A contagem está sempre à vista e desce enquanto se escolhe: é o que impede alguém de investir
 * quatro toques numa combinação que devolve zero, e veio do benchmark do Cookidoo.
 */
import { useEffect, useState } from 'react';
import type { Catalogue } from '../../data/catalogue.ts';
import { applyFilters, type CatalogueFilters } from '../../domain/filters.ts';
import {
  contagemSe,
  criteriosDeTriagem,
  limparApetencias,
  type CriterioTriagem,
} from '../../domain/triagem.ts';
import { IconDismiss } from '../../ui/icons.tsx';
import { icones } from '../../ui/icones-triagem.tsx';
import styles from './TriagemPanel.module.css';

interface TriagemPanelProps {
  catalogue: Catalogue;
  filters: CatalogueFilters;
  onChange: (filters: CatalogueFilters) => void;
  onClose: () => void;
}

/** Um ícone pela chave dos dados. Se faltar, não desenha nada — a etiqueta fica a dizer o que é. */
function Icone({ chave, size }: { chave: string; size: number }) {
  const Desenho = icones[chave as keyof typeof icones];
  if (!Desenho) return null;
  return <Desenho style={{ fontSize: size }} aria-hidden="true" />;
}

export function TriagemPanel({ catalogue, filters, onChange, onClose }: TriagemPanelProps) {
  const [aberto, setAberto] = useState<CriterioTriagem | undefined>();
  const criterios = criteriosDeTriagem(catalogue);
  const resultado = applyFilters(catalogue.recipes, filters).length;

  // Sair com Escape: o painel cobre o ecrã e não há botão de retroceder num tablet em modo app.
  useEffect(() => {
    const aoTeclar = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (aberto) setAberto(undefined);
      else onClose();
    };
    window.addEventListener('keydown', aoTeclar);
    return () => window.removeEventListener('keydown', aoTeclar);
  }, [aberto, onClose]);

  const escolhidas = (criterio: CriterioTriagem) =>
    criterio.opcoes.filter((o) => o.escolhida(filters));

  return (
    <div className={styles.fundo} role="dialog" aria-modal="true" aria-label="Apetece-me algo">
      <div className={styles.painel}>
        <div className={styles.topo}>
          <h2 className={styles.titulo}>{aberto ? aberto.nome : 'Apetece-me algo'}</h2>
          <button
            type="button"
            className={styles.fechar}
            onClick={() => (aberto ? setAberto(undefined) : onClose())}
            aria-label={aberto ? 'Voltar aos critérios' : 'Fechar'}
          >
            <IconDismiss />
          </button>
        </div>

        {aberto ? (
          /* Nível 2 — as opções de um critério, em mosaicos grandes. */
          <ul className={styles.grelhaOpcoes}>
            {aberto.opcoes.map((opcao) => {
              const escolhida = opcao.escolhida(filters);
              const quantas = contagemSe(catalogue.recipes, filters, opcao);
              return (
                <li key={opcao.id}>
                  <button
                    type="button"
                    className={escolhida ? `${styles.opcao} ${styles.escolhida}` : styles.opcao}
                    onClick={() => onChange(opcao.alternar(filters))}
                    aria-pressed={escolhida}
                  >
                    <Icone chave={opcao.icone} size={72} />
                    <span className={styles.nomeOpcao}>{opcao.nome}</span>
                    {/*
                      A contagem aparece antes da escolha e não depois: diz quantas sobram SE se
                      escolher isto. Zero fica visível e apagado em vez de virar um beco sem saída.
                    */}
                    <span className={styles.contagem}>{quantas}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          /* Nível 1 — os oito critérios. */
          <ul className={styles.grelhaCriterios}>
            {criterios.map((criterio) => {
              const escolhido = escolhidas(criterio);
              return (
                <li key={criterio.id}>
                  <button
                    type="button"
                    className={
                      criterio.eRegra ? `${styles.criterio} ${styles.regra}` : styles.criterio
                    }
                    onClick={() => setAberto(criterio)}
                  >
                    <Icone chave={criterio.icone} size={48} />
                    <span className={styles.nomeCriterio}>{criterio.nome}</span>
                    <span className={styles.resumo}>
                      {escolhido.length === 0
                        ? `${criterio.opcoes.length} opções`
                        : escolhido.map((o) => o.nome).join(', ')}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className={styles.rodape}>
          <button
            type="button"
            className={styles.limpar}
            onClick={() => onChange(limparApetencias(filters))}
          >
            Limpar
          </button>
          <button type="button" className={styles.ver} onClick={onClose}>
            {resultado === 1 ? 'Ver 1 receita' : `Ver ${resultado} receitas`}
          </button>
        </div>
      </div>
    </div>
  );
}
