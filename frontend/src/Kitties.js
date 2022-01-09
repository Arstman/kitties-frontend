import React, { useEffect, useState } from 'react'
import { Form, Grid } from 'semantic-ui-react'

import { useSubstrate } from './substrate-lib'
import { TxButton } from './substrate-lib/components'

import KittyCards from './KittyCards'

export default function Kitties (props) {
  const { api, keyring } = useSubstrate()
  const { accountPair } = props

  const [kitties, setKitties] = useState([])
  const [status, setStatus] = useState('')

  // dnas
  const [dnas, setDnas] = useState([])

  // fn to format DNA··
  const formatDna = (dna) => dna.isNone ? {} : dna.value.toU8a()

  // owners
  const [owners, setOwners] = useState([])

  const fetchKitties = () => {
    // TODO: 在这里调用 `api.query.kittiesModule.*` 函数去取得猫咪的信息。
    // 你需要取得：
    //   - 共有多少只猫咪
    //   - 每只猫咪的主人是谁
    //   - 每只猫咪的 DNA 是什么，用来组合出它的形态
    // 查询猫咪的数量

    let unsubCnt = null
    let unsubKitties = null
    let unsubOwners = null

    const asyncFetch = async () => {
      unsubCnt = await api.query.kittiesModule.kittiesCount(async (res) => {
        const total = res.isNone ? 0 : res.value.toNumber()
        const indexes = [...Array(total).keys()]

        unsubKitties = await api.query.kittiesModule.kitties.multi(indexes, kitties => {
          setDnas(kitties.map((dna, id) => formatDna(dna)))
        })

        unsubOwners = await api.query.kittiesModule.owner.multi(indexes, owners => {
          setOwners(owners.map(owner => owner.toHuman()))
        })
      })
    }

    asyncFetch()

    return () => {
      unsubCnt && unsubCnt() && unsubKitties && unsubKitties() && unsubOwners && unsubOwners()
    }
  }

  const populateKitties = () => {
    // TODO: 在这里添加额外的逻辑。你需要组成这样的数组结构：
    //  ```javascript
    //  const kitties = [{
    //    id: 0,
    //    dna: ...,
    //    owner: ...
    //  }, { id: ..., dna: ..., owner: ... }]
    //  ```
    // 这个 kitties 会传入 <KittyCards/> 然后对每只猫咪进行处理
    setKitties(dnas.map((dna, id) => ({ id, dna, owner: owners[id] })))
  }

  useEffect(fetchKitties, [api, keyring])
  useEffect(populateKitties, [dnas, owners])

  return <Grid.Column width={16}>
    <h1>小毛孩</h1>
    <KittyCards kitties={kitties} accountPair={accountPair} setStatus={setStatus}/>
    <Form style={{ margin: '1em 0' }}>
      <Form.Field style={{ textAlign: 'center' }}>
        <TxButton
          accountPair={accountPair} label='创建小毛孩' type='SIGNED-TX' setStatus={setStatus}
          attrs={{
            palletRpc: 'kittiesModule',
            callable: 'create',
            inputParams: [],
            paramFields: []
          }}
        />
      </Form.Field>
    </Form>
    <div style={{ overflowWrap: 'break-word' }}>{status}</div>
  </Grid.Column>
}
