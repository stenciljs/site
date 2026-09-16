import React, { useState } from 'react';
import Link from '@docusaurus/Link';
import styles from './LifecycleMethodsChart.module.css';

type HighlightVariant = 'none' | 'init' | 'update' | 'removed' | 'attached';

type ChartVariant = 'component' | 'controller';

export default function LifecycleMethodsChart({ variant = 'component' }: { variant?: ChartVariant }) {
  const [highlight, setHighlight] = useState<HighlightVariant>('none');
  const isController = variant === 'controller';
  // Reactive controllers hook into these lifecycle points via `Mixin(ReactiveControllerHost)`
  // - same flow, `host`-prefixed names. Each links to its own row in the hooks table on
  // mixins-and-controllers.md (same page this variant is embedded on, so a bare fragment works).
  const hostHookAnchor = {
    hostConnected: '#hostconnected',
    hostDisconnected: '#hostdisconnected',
    hostWillLoad: '#hostwillload',
    hostDidLoad: '#hostdidload',
    hostWillRender: '#hostwillrender',
    hostDidRender: '#hostdidrender',
    hostWillUpdate: '#hostwillupdate',
    hostDidUpdate: '#hostdidupdate',
  };

  const highlightClassName = highlight === 'none' ? '' : ` ${styles.highlight} ${styles[`highlight-${highlight}`]}`;

  return (
    <div className={styles.lifecycleChart + highlightClassName}>
      <svg version="1.1" viewBox="0 0 642.5 922" xmlns="http://www.w3.org/2000/svg">
        <g fillRule="evenodd">
          <g fill="none" strokeLinecap="square">
            <path
              d="m552 743c49.706 0 90-40.294 90-90v-488c0-58.5-47.2-106-105.5-106-58.393 0.16547-105.61 47.607-105.5 106l0.4 68"
              stroke="#7b83a6"
              className={styles.pathUpdate}
            />
            <path d="m437.7 600.3-6.3 6.3-6.3-6.3" stroke="#b3b6c5" className={styles.pathUpdate} />
            <path d="m431.4 347.5v258" stroke="#7b83a6" className={styles.pathUpdate} />
            <path d="m431.4 282.5v24.337" stroke="#7b83a6" strokeDasharray="1, 6" className={styles.pathUpdate} />
            <path d="m126.4 50v555.5" stroke="#212431" className={styles.pathInit} />
            <path d="m132.7 600.3-6.3 6.3-6.3-6.3" stroke="#212431" className={styles.pathInit} />
            <path d="m278 50v27.5" stroke="#575e7f" className={styles.pathAttached} />
            <path d="m284.3 71.993-6.3 6.3-6.3-6.3" stroke="#575e7f" className={styles.pathAttached} />
            <path d="m278.5 829v29.5" stroke="#575e7f" className={styles.pathRemoved} />
            <path d="m284.8 852.3-6.3 6.3-6.3-6.3" stroke="#575e7f" className={styles.pathRemoved} />
            <g fontFamily="SFMono-Regular, 'SF Mono', 'Lucida Console', monospace" fontSize="15px">
              <g>
                <Link to={isController ? hostHookAnchor.hostDidLoad : '#componentdidload'} className={styles.pathInit}>
                  <rect y="620" width="252" height="49" rx="24.5" ry="24.5" fill="#212431" />
                  <text x="2.2028809" y="166.83597" fill="#fff" textAnchor={isController ? 'middle' : undefined}>
                    <tspan x={isController ? 126 : 45.202881} y="648.83594">
                      {isController ? 'hostDidLoad()' : 'componentDidLoad()'}
                    </tspan>
                  </text>
                </Link>
              </g>
              <g>
                <Link to={isController ? hostHookAnchor.hostDidUpdate : '#componentdidupdate'} className={styles.pathUpdate}>
                  <rect x="303" y="620" width="252" height="49" rx="24.5" ry="24.5" fill="#7b83a6" />
                  <text x="2.8501587" y="166.83597" fill="#fff" textAnchor={isController ? 'middle' : undefined}>
                    <tspan x={isController ? 429 : 339.15015} y="648.83594">
                      {isController ? 'hostDidUpdate()' : 'componentDidUpdate()'}
                    </tspan>
                  </text>
                </Link>
              </g>
              <g>
                <Link href={isController ? hostHookAnchor.hostDisconnected : '#disconnectedcallback'} className={styles.pathRemoved}>
                  <rect x="152.5" y="873" width="252" height="49" rx="24.5" ry="24.5" fill="#4b516e" />
                  <text x="-18.570755" y="148.19852" fill="#fff" textAnchor={isController ? 'middle' : undefined}>
                    <tspan x={isController ? 278.5 : 179.72925} y="902.19849">
                      {isController ? 'hostDisconnected()' : 'disconnectedCallback()'}
                    </tspan>
                  </text>
                </Link>
              </g>
              <g>
                <Link to="reactive-data#the-watch-decorator-watch" className={styles.pathUpdate}>
                  <rect x="303" y="161" width="252" height="49" rx="24.5" ry="24.5" fill="#7b83a6" />
                  <text x="2.5288086" y="-8" fill="#fff">
                    <tspan x="348.52881" y="190">
                      @Watch(‘propName’)
                    </tspan>
                  </text>
                </Link>
              </g>
              <g>
                <Link to="templating-jsx" className={styles.pathInit + ' ' + styles.pathUpdate}>
                  <rect y="451" width="555" height="49" rx="24.5" ry="24.5" fill="#39b54a" />
                  <text x="1.035553" y="109.1985" fill="#fff">
                    <tspan x="241.43555" y="480.19852">
                      render()
                    </tspan>
                  </text>
                </Link>
              </g>
              <g>
                <Link to={isController ? hostHookAnchor.hostConnected : '#connectedcallback'} className={styles.pathInit + ' ' + styles.pathAttached}>
                  <rect x="65" y="89" width="275" height="49" rx="24.5" ry="24.5" fill="#4b516e" />
                  <text x="78.77652" y="26.198486" fill="#fff" textAnchor={isController ? 'middle' : undefined}>
                    <tspan x={isController ? 202.5 : 117.17651} y="118.19849">
                      {isController ? 'hostConnected()' : 'connectedCallback()'}
                    </tspan>
                  </text>
                </Link>
              </g>
              <g>
                <Link
                  to={isController ? 'component-lifecycle#componentshouldupdate' : '#componentshouldupdate'}
                  className={styles.pathUpdate}
                >
                  <rect x="303" y="233" width="252" height="49" rx="24.5" ry="24.5" fill="#7b83a6" />
                  <text x="-6.5288005" y="2.8359385" fill="#fff">
                    <tspan x="325.57117" y="261.83594">
                      componentShouldUpdate()
                    </tspan>
                  </text>
                </Link>
              </g>
              <g>
                <Link to={isController ? hostHookAnchor.hostWillRender : '#componentwillrender'} className={styles.pathInit + ' ' + styles.pathUpdate}>
                  <rect x="77.5" y="377" width="400" height="49" rx="24.5" ry="24.5" fill="#4b516e" />
                  <text x="-148.97623" y="146.83594" fill="#fff" textAnchor={isController ? 'middle' : undefined}>
                    <tspan x={isController ? 277.5 : 183.12378} y="405.83594">
                      {isController ? 'hostWillRender()' : 'componentWillRender()'}
                    </tspan>
                  </text>
                </Link>
              </g>
              <g>
                <Link to={isController ? hostHookAnchor.hostWillUpdate : '#componentwillupdate'} className={styles.pathUpdate}>
                  <rect x="303" y="305" width="252" height="49" rx="24.5" ry="24.5" fill="#7b83a6" />
                  <text x="2.5237732" y="74.835938" fill="#fff" textAnchor={isController ? 'middle' : undefined}>
                    <tspan x={isController ? 429 : 334.62378} y="333.83594">
                      {isController ? 'hostWillUpdate()' : 'componentWillUpdate()'}
                    </tspan>
                  </text>
                </Link>
              </g>
              <g>
                <Link to={isController ? hostHookAnchor.hostDidRender : '#componentdidrender'} className={styles.pathInit + ' ' + styles.pathUpdate}>
                  <rect x="77.5" y="523" width="400" height="49" rx="24.5" ry="24.5" fill="#4b516e" />
                  <text x="-144.44986" y="292.83597" fill="#fff" textAnchor={isController ? 'middle' : undefined}>
                    <tspan x={isController ? 277.5 : 187.65015} y="551.83594">
                      {isController ? 'hostDidRender()' : 'componentDidRender()'}
                    </tspan>
                  </text>
                </Link>
              </g>
              <g>
                <Link to={isController ? hostHookAnchor.hostWillLoad : '#componentwillload'} className={styles.pathInit}>
                  <rect y="161" width="252" height="49" rx="24.5" ry="24.5" fill="#212431" />
                  <text x="2.2765121" y="97.835938" fill="#fff" textAnchor={isController ? 'middle' : undefined}>
                    <tspan x={isController ? 126 : 40.676514} y="189.83594">
                      {isController ? 'hostWillLoad()' : 'componentWillLoad()'}
                    </tspan>
                  </text>
                </Link>
              </g>
            </g>
            <g fontSize="14px" letterSpacing="-.2" textAnchor="middle">
              <g
                className="trigger path-init"
                onMouseOver={() => setHighlight('init')}
                onMouseOut={() => setHighlight('none')}
              >
                <rect width="190" height="50" rx="4" ry="4" fill="#fdf5e4" />
                <text x="111.24316" y="-1.0898438" fill="#9a6400">
                  <tspan x="95.239258" y="28.910156">
                    Component initialized
                  </tspan>
                </text>
              </g>
              <g
                className="trigger path-update"
                onMouseOver={() => setHighlight('update')}
                onMouseOut={() => setHighlight('none')}
              >
                <rect x="1" y="718" width="555" height="50" rx="4" ry="4" fill="#fdf5e4" />
                <text x="344.75723" y="166.90677" fill="#9a6400">
                  <tspan x="278.08643" y="746.90674">
                    Change in a value of prop or state triggers rerender
                  </tspan>
                </text>
              </g>
              <g
                className="trigger path-removed"
                onMouseOver={() => setHighlight('removed')}
                onMouseOut={() => setHighlight('none')}
              >
                <rect x="1" y="779" width="555" height="50" rx="4" ry="4" fill="#fdf5e4" />
                <text x="138.02324" y="167.91019" fill="#9a6400">
                  <tspan x="278.73926" y="807.91016">
                    Component removed
                  </tspan>
                </text>
              </g>
              <g
                className="trigger path-attached"
                onMouseOver={() => setHighlight('attached')}
                onMouseOut={() => setHighlight('none')}
              >
                <rect x="215" width="190" height="50" rx="4" ry="4" fill="#fdf5e4" />
                <text x="330.85489" y="-1.0898438" fill="#9a6400">
                  <tspan x="310.23926" y="28.910156">
                    Component reattached
                  </tspan>
                </text>
              </g>
            </g>
          </g>
        </g>
      </svg>
    </div>
  );
}
